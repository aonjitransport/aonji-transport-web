import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { LoadStatement } from "../../../../../models/LoadStatement";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 note: params is async
) {
  try {
    await connectToDatabase();

    const { id } = await context.params; // 👈 await it here

    if (!id) {
      return NextResponse.json({ error: "Load Statement ID is required" }, { status: 400 });
    }

    const statement = await LoadStatement.findById(id)
      .populate("agency", "name city phone address")
      .populate({
        path: "trips",
        populate: {
          path: "bills",
          select: "billId totalAmount city date",
        },
      });

    if (!statement) {
      return NextResponse.json({ error: "Load Statement not found" }, { status: 404 });
    }

    return NextResponse.json(statement, { status: 200 });
  } catch (error) {
    console.error("Error fetching load statement by ID:", error);
    return NextResponse.json({ error: "Failed to fetch load statement" }, { status: 500 });
  }
}
