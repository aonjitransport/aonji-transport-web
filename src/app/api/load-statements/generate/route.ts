import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { LoadStatement } from "../../../../../models/LoadStatement";
import { Trip } from "../../../../../models/Trip";
import { Agency } from "../../../../../models/Agency";



export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const now = new Date();
    const month = now.getMonth(); // 0-indexed
    const year = now.getFullYear();

    // Define month start/end range
    const startOfMonth = new Date(Date.UTC(year, month, 1));
    const endOfMonth = new Date(Date.UTC(year, month + 1, 1));

    // Get all agencies
    const agencies = await Agency.find({});
    let generatedStatements = [];

    for (const agency of agencies) {
      // Find all trips for this agency within this month
      const trips = await Trip.find({
        agency: agency._id,
        createdAt: { $gte: startOfMonth, $lt: endOfMonth },
      });

      if (trips.length === 0) continue; // Skip if no trips this month

      const totalFreightAmount = trips.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
      const balanceDue = trips.reduce((sum, t) => sum + (t.netPayableAmount || 0), 0);

      // Generate readable Load Statement ID: LS-MMYY-001
      const monthStr = String(month + 1).padStart(2, "0");
      const yearStr = String(year).slice(-2);

      const existingCount = await LoadStatement.countDocuments({
        month: month + 1,
        year,
      });
      const serial = String(existingCount + 1).padStart(3, "0");

      const loadStatementId = `LS-${monthStr}${yearStr}-${serial}`;

      // Create load statement
      const statement = await LoadStatement.create({
        loadStatementId,
        agency: agency._id,
        trips: trips.map((t) => t._id),
        totalFreightAmount,
        balanceDue,
        month: month + 1,
        year,
      });

      generatedStatements.push(statement);
    }

    return NextResponse.json({
      message: "Load statements generated successfully",
      count: generatedStatements.length,
      statements: generatedStatements,
    });
  } catch (error) {
    console.error("Error generating load statements:", error);
    return NextResponse.json({ error: "Failed to generate load statements" }, { status: 500 });
  }
}
