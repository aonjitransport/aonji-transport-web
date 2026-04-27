import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { requireRole } from "../../../../../lib/auth";
import { LoadStatement } from "../../../../../models/LoadStatement";
import { Trip } from "../../../../../models/Trip";
import { Branch } from "../../../../../models/Branch";

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["admin", "super_admin"]);
  if (auth instanceof NextResponse) return auth;

  await connectToDatabase();

  try {
    const { branchId, month, year } = await req.json();

    if (!branchId || !month || !year) {
      return NextResponse.json(
        { error: "branchId, month and year are required" },
        { status: 400 }
      );
    }

    const monthNum = Number(month);
    const yearNum = Number(year);

    if (isNaN(monthNum) || isNaN(yearNum)) {
      return NextResponse.json(
        { error: "month and year must be valid numbers" },
        { status: 400 }
      );
    }

    // Check if already exists
    const existing = await LoadStatement.findOne({
      branch: branchId,
      month: monthNum,
      year: yearNum,
    });

    if (existing) {
      return NextResponse.json(
        { error: `Statement already exists: ${existing.loadStatementId}` },
        { status: 409 }
      );
    }

    // Find COMPLETED trips for this branch in this month
    const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1));
    const endDate = new Date(Date.UTC(yearNum, monthNum, 1));

    const trips = await Trip.find({
      destinationBranch: branchId,
      status: "COMPLETED",
      createdAt: { $gte: startDate, $lt: endDate },
    });

    if (trips.length === 0) {
      return NextResponse.json(
        { error: "No completed trips found for this branch in the selected month" },
        { status: 404 }
      );
    }

    // Calculate totals
    const totalFreightAmount = trips.reduce(
      (sum, t) => sum + (t.totalAmount || 0), 0
    );
    const agencyCommission = trips.reduce(
      (sum, t) => sum + (t.agencyCharges?.chargeAmount || 0), 0
    );
    const netPayableToMain = totalFreightAmount - agencyCommission;

    // Generate unique ID e.g. LS-KDPA-2026-04
    const branchDoc = await Branch.findById(branchId).select("code");
    const monthStr = String(monthNum).padStart(2, "0");
    const loadStatementId = `LS-${branchDoc?.code || "XX"}-${yearNum}-${monthStr}`;

    const statement = await LoadStatement.create({
      loadStatementId,
      branch: branchId,
      trips: trips.map((t) => t._id),
      totalFreightAmount,
      agencyCommission,
      netPayableToMain,
      balanceDue: netPayableToMain,
      paidAmount: 0,
      paymentStatus: "pending",  // ✅ was: false (boolean) — now string enum
      month: monthNum,
      year: yearNum,
    });

    return NextResponse.json(statement, { status: 201 });

  } catch (err) {
    console.error("❌ GENERATE LOAD STATEMENT ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}