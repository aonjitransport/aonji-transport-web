// aonji_transport_nextjs/src/app/api/load-statements/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import "../../../../models/index.ts"; // Ensure all models are registered
import { LoadStatement } from "../../../../models/LoadStatement";

const monthMap: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    // ✅ FIX 1: use consistent param name
    const branch = searchParams.get("branch");
    let month = searchParams.get("month");
    const year = searchParams.get("year");
    const paymentStatus = searchParams.get("paymentStatus");

    if (!branch) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      );
    }

    const filter: any = { branch };

    // ✅ FIX 2: safe month handling (string OR number)
    if (month) {
      if (!isNaN(Number(month))) {
        filter.month = Number(month);
      } else {
        month = month.toLowerCase();
        if (monthMap[month]) {
          filter.month = monthMap[month];
        }
      }
    }

    // ✅ Optional year
    if (year && !isNaN(Number(year))) {
      filter.year = Number(year);
    }

    // ✅ Optional paymentStatus
    if (paymentStatus === "true" || paymentStatus === "false") {
      filter.paymentStatus = paymentStatus === "true";
    }

    const statements = await LoadStatement.find(filter)
      .populate("branch", "name city")
      .populate("trips")
      .sort({ createdAt: -1 });

    return NextResponse.json(statements, { status: 200 });
  } catch (error) {
    console.error("Error fetching load statements:", error);
    return NextResponse.json(
      { error: "Failed to fetch load statements" },
      { status: 500 }
    );
  }
}
