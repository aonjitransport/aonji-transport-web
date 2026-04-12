// app/api/trips/start/route.js

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { requireRole } from "../../../../../lib/auth";
import { Trip } from "../../../../../models/Trip";
import { Bill } from "../../../../../models/Bill";

export async function POST(req) {
  await connectToDatabase();

  const session = await mongoose.startSession();

  try {
    const auth = await requireRole(req, ["admin", "super_admin", "agent"]);
    if (auth instanceof NextResponse) return auth;

    const { tripId } = await req.json();

    if (!tripId) {
      return NextResponse.json({ error: "Trip ID required" }, { status: 400 });
    }

    session.startTransaction();

    // ✅ Get Trip
    const trip = await Trip.findById(tripId).session(session);

    if (!trip) {
      throw new Error("Trip not found");
    }

    // ✅ Prevent wrong state transition
    if (trip.status !== "PLANNED") {
      throw new Error("Only PLANNED trips can be started");
    }

    // ✅ Update Trip
    trip.status = "STARTED";
    await trip.save({ session });

    // ✅ Update all Bills in trip
    await Bill.updateMany(
      { trip: trip._id },
      {
        $set: {
          status: "IN_TRANSIT",
          currentLocation: "On Route"
        },
        $push: {
          statusHistory: {
            status: "IN_TRANSIT",
            date: new Date(),
            updatedBy: auth.user.id
          }
        }
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      { message: "Trip started successfully" },
      { status: 200 }
    );

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("Start Trip Error:", err);

    return NextResponse.json(
      { error: err.message || "Failed to start trip" },
      { status: 500 }
    );
  }
}