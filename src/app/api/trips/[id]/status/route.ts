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

    const body = await req.json();
    const { status } = body;

    /* ---------------- VALIDATION ---------------- */

    const allowedStatuses = [
      "PLANNED",
      "IN_TRANSIT",
      "REACHED",
      "COMPLETED",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    session.startTransaction();

    const trip = await Trip.findById(params.id).session(session);

    if (!trip) {
      throw new Error("Trip not found");
    }

    const incompleteBills = await Bill.countDocuments({
  _id: { $in: trip.bills },
  status: { $nin: ["DELIVERED", "POD_RECEIVED"] }
});

if (status === "COMPLETED" && incompleteBills > 0) {
  return NextResponse.json(
    { error: "All bills must be delivered before completing trip" },
    { status: 400 }
  );
}

    if (trip.status === status) {
  return NextResponse.json(
    { error: "Trip already in this status" },
    { status: 400 }
  );
}

    const isOrigin = trip.originBranch.equals(userBranchId);
    const isDestination = trip.destinationBranch.equals(userBranchId);

    /* ---------------- STATUS FLOW CONTROL ---------------- */

    const validTransitions: any = {
      PLANNED: ["IN_TRANSIT"],
      IN_TRANSIT: ["REACHED"],
      REACHED: ["COMPLETED"],
      COMPLETED: [],
    };

    if (!validTransitions[trip.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Invalid transition from ${trip.status} → ${status}` },
        { status: 400 }
      );
    }

    /* ---------------- ROLE RULES ---------------- */

    if (status === "IN_TRANSIT" && !isOrigin) {
      return NextResponse.json(
        { error: "Only origin branch can start trip" },
        { status: 403 }
      );
    }

    if (status === "REACHED" && !isDestination) {
      return NextResponse.json(
        { error: "Only destination branch can mark as reached" },
        { status: 403 }
      );
    }

    if (status === "COMPLETED" && !isDestination) {
      return NextResponse.json(
        { error: "Only destination branch can complete trip" },
        { status: 403 }
      );
    }

    /* ---------------- UPDATE TRIP ---------------- */

    trip.status = status;
    await trip.save({ session });

      await Trip.updateOne( 
        { _id: trip._id },
        {
          $push: {  
            statusHistory: {
              status: status,
              date: new Date(), 
              updatedBy: auth.user.id,
            },
          },
        },
        { session }
      );  
        

    /* ---------------- AUTO BILL SYNC ---------------- */

    let billStatus: string | null = null;

    if (status === "IN_TRANSIT") {
      billStatus = "IN_TRANSIT";
    }

    if (status === "REACHED") {
      billStatus = "ARRIVED_AT_BRANCH";
    }

    // ❗ IMPORTANT: DO NOT AUTO COMPLETE BILLS
    // Bills should be delivered individually
    // So we skip COMPLETED → DELIVERED

    if (billStatus) {
      await Bill.updateMany(
        { _id: { $in: trip.bills } },
        {
          $set: {
            status: billStatus,
            currentLocation:
              status === "REACHED"
                ? "At Destination Branch"
                : "On Route",
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
      message: "Trip status updated successfully",
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Trip status update failed:", error);

    return NextResponse.json(
      { error: "Failed to update trip status" },
      { status: 500 }
    );
  }
}