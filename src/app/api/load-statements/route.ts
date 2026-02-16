import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import "../../../../models/index.ts"; // Ensure all models are registered
import { LoadStatement } from "../../../../models/LoadStatement";
import { Agency } from "../../../../models/Agency";
import  { Trip } from "../../../../models/Trip";


export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const agency = searchParams.get("agency");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const paymentStatus = searchParams.get("paymentStatus"); // ✅ added

    if (!agency) {
      return NextResponse.json({ error: "Agency ID is required" }, { status: 400 });
    }

    const filter: any = { agency };

    // ✅ Optional month filter
    if (month) {
      const monthNames = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
      ];
      const m = monthNames.findIndex((mn) => mn === month.toLowerCase());
      if (m !== -1) filter.month = m + 1;
    }

    // ✅ Optional year filter
    if (year) filter.year = parseInt(year);

    // ✅ Optional paymentStatus filter
    if (paymentStatus === "true" || paymentStatus === "false") {
      filter.paymentStatus = paymentStatus === "true";
    }

    const statements = await LoadStatement.find(filter)
      .populate("agency", "name city")
      .populate("trips")
      .sort({ createdAt: -1 });

    return NextResponse.json(statements, { status: 200 });
  } catch (error) {
    console.error("Error fetching load statements:", error);
    return NextResponse.json({ error: "Failed to fetch load statements" }, { status: 500 });
  }
}
