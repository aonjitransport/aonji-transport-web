import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { Trip } from "../../../../../models/Trip";
import { Branch } from "../../../../../models/Branch"; // ✅ REQUIRED
import { requireRole } from "lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    const auth = await requireRole(req, ["admin", "super_admin", "agent"]);
    if (auth instanceof NextResponse) return auth;

    const trip = await Trip.findOne({
      $or: [
        { tripId: params.id }, // if passed tripId like "TS-RATP-2026-002"
        ...(params.id.length === 24 // if passed actual MongoDB _id
          ? [{ _id: params.id }]
          : []),
      ],
    })
      .populate({
        path: "bills",
        populate: [
          { path: "fromBranch", select: "name" },
          { path: "toBranch", select: "name" },
        ],
      })
      .populate("originBranch", "name")
      .populate("destinationBranch", "name")
      .lean();

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch trip" },
      { status: 500 },
    );
  }
}
