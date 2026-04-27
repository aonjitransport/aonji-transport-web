// app/api/cron/generate-statements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/../../lib/mongodb";
import { LoadStatement } from "@/../../models/LoadStatement";
import { Trip } from "@/../../models/Trip";
import { Branch } from "@/../../models/Branch";

export async function GET(req: NextRequest) {
  // 🔒 Secure with a secret so only Vercel cron can call it
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  // Get last month
  const now = new Date();
  const monthNum = now.getMonth() === 0 ? 12 : now.getMonth(); // previous month
  const yearNum = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1));
  const endDate = new Date(Date.UTC(yearNum, monthNum, 1));

  // Get all active AGENT branches
  const agentBranches = await Branch.find({ type: "AGENT", isActive: true }).select("_id code");

  const results = [];

  for (const branch of agentBranches) {
    // Skip if already generated
    const existing = await LoadStatement.findOne({
      branch: branch._id,
      month: monthNum,
      year: yearNum,
    });
    if (existing) {
      results.push({ branch: branch.code, status: "skipped - already exists" });
      continue;
    }

    const trips = await Trip.find({
      destinationBranch: branch._id,
      status: "COMPLETED",
      createdAt: { $gte: startDate, $lt: endDate },
    });

    if (trips.length === 0) {
      results.push({ branch: branch.code, status: "skipped - no trips" });
      continue;
    }

    const totalFreightAmount = trips.reduce((s, t) => s + (t.totalAmount || 0), 0);
    const agencyCommission = trips.reduce((s, t) => s + (t.agencyCharges?.chargeAmount || 0), 0);
    const netPayableToMain = totalFreightAmount - agencyCommission;
    const monthStr = String(monthNum).padStart(2, "0");

    await LoadStatement.create({
      loadStatementId: `LS-${branch.code}-${yearNum}-${monthStr}`,
      branch: branch._id,
      trips: trips.map((t) => t._id),
      totalFreightAmount,
      agencyCommission,
      netPayableToMain,
      balanceDue: netPayableToMain,
      paidAmount: 0,
      paymentStatus: false,
      month: monthNum,
      year: yearNum,
    });

    results.push({ branch: branch.code, status: "generated" });
  }

  return NextResponse.json({ success: true, results });
}