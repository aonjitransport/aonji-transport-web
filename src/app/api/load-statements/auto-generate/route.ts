export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { LoadStatement } from "../../../../../models/LoadStatement";
import { Trip } from "../../../../../models/Trip";
import { Branch } from "../../../../../models/Branch";

export async function GET(request: Request) {
  try {

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }


    const today = new Date();

    // generate statement for previous month
    const year = today.getFullYear();
    const month = today.getMonth(); 

    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const branches = await Branch.find();

    const results = [];

    for (const branch of branches) {

      const exists = await LoadStatement.findOne({
        branch: branch._id,
        month,
        year
      });

      if (exists) continue;

      const trips = await Trip.find({
        branch: branch._id,
        createdAt: { $gte: start, $lt: end }
      });

      if (!trips.length) continue;

      const totalFreightAmount = Number(
        trips.reduce((sum, t) => sum + (t.totalAmount || 0), 0).toFixed(2)
      );

      const balanceDue = Number(
        trips.reduce((sum, t) => sum + (t.netPayableAmount || 0), 0).toFixed(2)
      );

      const monthStr = String(month).padStart(2, "0");
      const yearStr = String(year).slice(-2);

      const loadStatementId = `LS-${branch.code}-${monthStr}${yearStr}`;

      const statement = await LoadStatement.create({
        loadStatementId,
        branch: branch._id,
        trips: trips.map(t => t._id),
        totalFreightAmount,
        balanceDue,
        month,
        year,
        paymentStatus: false
      });

      results.push(statement);
    }

    return NextResponse.json({
      message: "Auto generation complete",
      results
    });

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      { error: "Auto generation failed" },
      { status: 500 }
    );
  }
}