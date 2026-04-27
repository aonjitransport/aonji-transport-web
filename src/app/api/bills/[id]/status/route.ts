// src/app/api/bills/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "lib/mongodb";
import { Bill } from "models/Bill";
import { Trip } from "models/Trip";
import { requireRole } from "lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const auth = await requireRole(req, ["admin", "super_admin", "agent"]);
    if (auth instanceof NextResponse) return auth;

    const userBranchId = new mongoose.Types.ObjectId(auth.user.branchId);
    const { status } = await req.json();

    /* ── VALID STATUSES ── */
    const allowedStatuses = [
      "CREATED",
      "ADDED_TO_TRIP",
      "IN_TRANSIT",
      "ARRIVED_AT_BRANCH",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "POD_RECEIVED",
      "MISSING",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    /* ── FETCH BILL ── */
    const bill = await Bill.findById(params.id);
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }
    if (bill.status === status) {
      return NextResponse.json({ error: "Bill already in this status" }, { status: 400 });
    }

    /* ── FETCH TRIP ── */
    const trip = await Trip.findOne({ bills: bill._id });
    if (!trip) {
      return NextResponse.json({ error: "No trip found for this bill" }, { status: 400 });
    }

    /* ── BRANCH PERMISSIONS ── */
    const isOrigin = bill.fromBranch.equals(userBranchId);
    const isDestination = bill.toBranch.equals(userBranchId);

    /* ── VALID TRANSITIONS (Bill level) ── */
    const validTransitions: Record<string, string[]> = {
      CREATED:            ["ADDED_TO_TRIP"],
      ADDED_TO_TRIP:      ["IN_TRANSIT"],
      IN_TRANSIT:         ["ARRIVED_AT_BRANCH"],
      ARRIVED_AT_BRANCH:  ["OUT_FOR_DELIVERY"],
      OUT_FOR_DELIVERY:   ["DELIVERED"],
      DELIVERED:          [],   // POD_RECEIVED only via admin verification
      POD_RECEIVED:       [],
      MISSING:            [],
    };

    if (!validTransitions[bill.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Invalid transition: ${bill.status} → ${status}` },
        { status: 400 }
      );
    }

    /* ── TRIP STATUS DEPENDENCY CHECKS ──
       This is the core enforcement — bill status must align with trip status
    ─────────────────────────────────────────────────────────────────────── */

    // Bill cannot go IN_TRANSIT unless trip is IN_TRANSIT
    if (status === "IN_TRANSIT" && trip.status !== "IN_TRANSIT") {
      return NextResponse.json(
        { error: "Trip must be IN_TRANSIT before bills can move to IN_TRANSIT" },
        { status: 400 }
      );
    }

    // Bill cannot go ARRIVED_AT_BRANCH unless trip is REACHED
    if (status === "ARRIVED_AT_BRANCH" && trip.status !== "REACHED") {
      return NextResponse.json(
        { error: "Trip must be REACHED before bills can arrive at branch" },
        { status: 400 }
      );
    }

    // OUT_FOR_DELIVERY and DELIVERED only when trip is REACHED
    if (
      ["OUT_FOR_DELIVERY", "DELIVERED"].includes(status) &&
      trip.status !== "REACHED"
    ) {
      return NextResponse.json(
        { error: "Trip must be REACHED before delivery actions" },
        { status: 400 }
      );
    }

    /* ── BRANCH PERMISSION RULES ── */

    // Origin branch actions
    if (["ADDED_TO_TRIP", "IN_TRANSIT"].includes(status) && !isOrigin) {
      return NextResponse.json(
        { error: "Only origin branch can perform this action" },
        { status: 403 }
      );
    }

    // Destination branch actions
    if (
      ["ARRIVED_AT_BRANCH", "OUT_FOR_DELIVERY", "DELIVERED"].includes(status) &&
      !isDestination
    ) {
      return NextResponse.json(
        { error: "Only destination branch can perform this action" },
        { status: 403 }
      );
    }

    /* ── UPDATE BILL ── */
    bill.status = status;

    const locationMap: Record<string, string> = {
      ADDED_TO_TRIP:      "Waiting at Origin",
      IN_TRANSIT:         "On Route",
      ARRIVED_AT_BRANCH:  "Destination Branch",
      OUT_FOR_DELIVERY:   "Out for Delivery",
      DELIVERED:          "Delivered",
    };

    if (locationMap[status]) {
      bill.currentLocation = locationMap[status];
    }

    if (status === "DELIVERED") {
      bill.deliveredAt = new Date();
    }

    bill.statusHistory.push({
      status,
      date: new Date(),
      updatedBy: auth.user.id,
    });

    await bill.save();

    return NextResponse.json(bill);

  } catch (err) {
    console.error("Bill status update failed:", err);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}