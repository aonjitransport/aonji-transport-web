// src/app/api/bills/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "lib/mongodb";
import { Bill } from "models/Bill";
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

    /* ---------------- VALID STATUSES ---------------- */

    const allowedStatuses = [
      "CREATED",
      "IN_WAREHOUSE",
      "ADDED_TO_TRIP",
      "IN_TRANSIT",
      "ARRIVED_AT_BRANCH",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "POD_RECEIVED"
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    

    const bill = await Bill.findById(params.id);

    if (!bill) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      );
    }

    if (bill.status === status) {
  return NextResponse.json(
    { error: "Bill already in this status" },
    { status: 400 }
  );
}

    const isOrigin = bill.fromBranch.equals(userBranchId);
    const isDestination = bill.toBranch.equals(userBranchId);

    /* ---------------- STATUS FLOW CONTROL ---------------- */

    const validTransitions: any = {
      CREATED: ["ADDED_TO_TRIP"],
      ADDED_TO_TRIP: ["IN_TRANSIT"],
      IN_TRANSIT: ["ARRIVED_AT_BRANCH"],
      ARRIVED_AT_BRANCH: ["OUT_FOR_DELIVERY"],
      OUT_FOR_DELIVERY: ["DELIVERED"],
      DELIVERED: ["POD_RECEIVED"],
      POD_RECEIVED: []
    };

    if (!validTransitions[bill.status]?.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid transition from ${bill.status} → ${status}`
        },
        { status: 400 }
      );
    }

    /* ---------------- PERMISSION RULES ---------------- */

    // 🚫 Origin cannot touch after transit starts
    if (
      ["ARRIVED_AT_BRANCH", "OUT_FOR_DELIVERY", "DELIVERED", "POD_RECEIVED"].includes(status) &&
      !isDestination
    ) {
      return NextResponse.json(
        { error: "Only destination branch can update this status" },
        { status: 403 }
      );
    }

    // 🚫 Destination cannot change early stages
    if (
      ["ADDED_TO_TRIP", "IN_TRANSIT"].includes(status) &&
      !isOrigin
    ) {
      return NextResponse.json(
        { error: "Only origin branch can update this status" },
        { status: 403 }
      );
    }

    /* ---------------- UPDATE ---------------- */

    bill.status = status;

    // Optional: update location
    if (status === "IN_TRANSIT") {
      bill.currentLocation = "On Route";
    }

    if (status === "ARRIVED_AT_BRANCH") {
      bill.currentLocation = "Destination Branch";
    }

    if (status === "OUT_FOR_DELIVERY") {
      bill.currentLocation = "Out for Delivery";
    }

    if (status === "DELIVERED") {
      bill.currentLocation = "Delivered";
      bill.deliveredAt = new Date();
    }

    bill.statusHistory.push({
      status,
      date: new Date(),
      updatedBy: auth.user.id
    });

    await bill.save();

    console.log("Current:", bill.status, "Incoming:", status);

    return NextResponse.json(bill);

  } catch (err) {
    console.error("Bill status update failed:", err);

    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}