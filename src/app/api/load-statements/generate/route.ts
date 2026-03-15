// src/app/api/load-statements/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { LoadStatement } from "../../../../../models/LoadStatement";
import { Trip } from "../../../../../models/Trip";
import { Branch } from "../../../../../models/Branch";

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


/* =========================
   GENERATE LOAD STATEMENT
========================= */

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    let { branchId, month, year } = await req.json();

    // ✅ Normalize month
if (typeof month === "string") {
  const m = monthMap[month.toLowerCase()];
  if (!m) {
    return NextResponse.json(
      { error: "Invalid month value" },
      { status: 400 }
    );
  }
  month = m;
}

    

    if (!branchId || !month || !year) {
      return NextResponse.json(
        { error: "branchId, month and year are required" },
        { status: 400 }
      );
    }

    // ✅ Validate branch
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return NextResponse.json(
        { error: "Branch not found" },
        { status: 404 }
      );
    }

    // ✅ Month date range
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 1));

    // ✅ Prevent duplicate load statement
    const existingStatement = await LoadStatement.findOne({
      branch: branchId,
      month,
      year,
    });

    if (existingStatement) {
      return NextResponse.json(
        { error: "Load statement already exists for this branch and month" },
        { status: 409 }
      );
    }

    // ✅ Fetch trips
    const trips = await Trip.find({
      branch: branchId,
      createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    });

    if (!trips.length) {
      return NextResponse.json(
        { error: "No trips found for this branch in the given month" },
        { status: 404 }
      );
    }

    // ✅ Calculations (matches your Trip schema perfectly)
   const totalFreightAmount = Number(
  trips.reduce((sum, t) => sum + (t.totalAmount || 0), 0).toFixed(2)
);

const balanceDue = Number(
  trips.reduce((sum, t) => sum + (t.netPayableAmount || 0), 0).toFixed(2)
);

    // ✅ Load Statement ID (stable & readable)
    const monthStr = String(month).padStart(2, "0");
    const yearStr = String(year).slice(-2);
    const loadStatementId = `LS-${branch.code}-${monthStr}${yearStr}`;

    // ✅ Create statement
    const statement = await LoadStatement.create({
      loadStatementId,
      branch: branchId,
      trips: trips.map(t => t._id),
      totalFreightAmount,
      balanceDue,
      month,
      year,
      paymentStatus: false,
    });

    return NextResponse.json({
      message: "Load statement generated successfully",
      statement,
    });
  } catch (error) {
    console.error("Error generating load statement:", error);
    return NextResponse.json(
      { error: "Failed to generate load statement" },
      { status: 500 }
    );
  }
}
