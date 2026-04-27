// src/app/api/trips/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "lib/mongodb";
import { Trip } from "models/Trip";
import { Bill } from "models/Bill";
import { requireRole } from "lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  const session = await mongoose.startSession();

  try {
    const auth = await requireRole(req, ["admin", "super_admin", "agent"]);
    if (auth instanceof NextResponse) return auth;

    const userBranchId = new mongoose.Types.ObjectId(auth.user.branchId);
    const { status } = await req.json();

    /* ── VALID TRIP STATUSES (manual transitions only) ── */
    const manualStatuses = ["IN_TRANSIT", "REACHED"];

    if (!status || !manualStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    session.startTransaction();

    const trip = await Trip.findById(params.id).session(session);
    if (!trip) throw new Error("Trip not found");

    if (trip.status === status) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: "Trip already in this status" }, { status: 400 });
    }

    const isOrigin = trip.originBranch.equals(userBranchId);
    const isDestination = trip.destinationBranch.equals(userBranchId);

    /* ── VALID TRIP TRANSITIONS ──
       PLANNED → IN_TRANSIT → REACHED → COMPLETED (auto)
    ─────────────────────────────────────────────── */
    const validTransitions: Record<string, string[]> = {
      PLANNED:    ["IN_TRANSIT"],
      IN_TRANSIT: ["REACHED"],
      REACHED:    [],       // COMPLETED is automatic — triggered by POD verification
      COMPLETED:  [],
    };

    if (!validTransitions[trip.status]?.includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { error: `Invalid transition: ${trip.status} → ${status}` },
        { status: 400 }
      );
    }

    /* ── BRANCH PERMISSION RULES ── */
    if (status === "IN_TRANSIT" && !isOrigin) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { error: "Only origin branch can start the trip" },
        { status: 403 }
      );
    }

    if (status === "REACHED" && !isDestination) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { error: "Only destination branch can mark trip as reached" },
        { status: 403 }
      );
    }

    /* ── UPDATE TRIP ── */
    trip.status = status;
    trip.statusHistory.push({
      status,
      date: new Date(),
      updatedBy: auth.user.id,
    });
    await trip.save({ session });

    /* ── AUTO SYNC BILLS when trip status changes ──
       Trip IN_TRANSIT  → all bills: IN_TRANSIT
       Trip REACHED     → all bills: ARRIVED_AT_BRANCH

       This enforces that bills CANNOT manually jump ahead of the trip.
       The dependency is maintained here automatically.
    ──────────────────────────────────────────────── */
    const billSyncMap: Record<string, string> = {
      IN_TRANSIT: "IN_TRANSIT",
      REACHED:    "ARRIVED_AT_BRANCH",
    };

    const billStatus = billSyncMap[status];

    if (billStatus) {
      const locationMap: Record<string, string> = {
        IN_TRANSIT:         "On Route",
        ARRIVED_AT_BRANCH:  "Destination Branch",
      };

      await Bill.updateMany(
        { _id: { $in: trip.bills } },
        {
          $set: {
            status: billStatus,
            currentLocation: locationMap[billStatus],
          },
          $push: {
            statusHistory: {
              status: billStatus,
              date: new Date(),
              updatedBy: auth.user.id,
            },
          },
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      success: true,
      message: `Trip updated to ${status}. Bills auto-synced to ${billSyncMap[status] || status}.`,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Trip status update failed:", error);
    return NextResponse.json({ error: "Failed to update trip status" }, { status: 500 });
  }
}