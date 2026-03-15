import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { Trip } from "../../../../../models/Trip";
import { Branch } from "../../../../../models/Branch"; // ✅ REQUIRED

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    const trip = await Trip.findById(id)
      .populate("branch", "name city phone address")
      .populate({
        path: "bills",
        populate: [
          {
            path: "consigner",
            select: "name phone address",
          },
          {
            path: "consignees",
            select: "name phone numOfParcels type amount address",
          },
        ],
      });

    if (!trip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(trip, { status: 200 });
  } catch (error) {
    console.error("Error fetching trip by ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip" },
      { status: 500 }
    );
  }
}
