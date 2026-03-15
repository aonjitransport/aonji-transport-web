import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "../../../../../../lib/mongodb";
import { Trip } from "../../../../../../models/Trip";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid trip id" }, { status: 400 });
    }

    const trip = await Trip.findByIdAndUpdate(
      params.id,
      { status: "delivered" },
      { new: true }
    );

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(trip);

  } catch (error) {
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}