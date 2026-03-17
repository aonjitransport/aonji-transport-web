export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { Bill } from "../../../../models/Bill";

// 🔍 Search consigners dynamically
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("search") || "";

    if (!query) {
      return NextResponse.json([]);
    }

    // Find bills whose consigner name matches the search (case-insensitive)
    const bills = await Bill.find({
      "consigner.name": { $regex: query, $options: "i" },
    }).select("consigner");

    // Extract unique consigners (by name)
    const uniqueConsigners = Array.from(
      new Map(
        bills.map((b) => [b.consigner.name, b.consigner])
      ).values()
    );

    return NextResponse.json(uniqueConsigners);
  } catch (error) {
    console.error("Error fetching consigners:", error);
    return NextResponse.json(
      { error: "Failed to fetch consigners" },
      { status: 500 }
    );
  }
}