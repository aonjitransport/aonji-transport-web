import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import {
  generateLoadStatementsForPeriod,
  getPreviousMonthPeriod,
} from "../../../../../lib/loadStatementGenerator";

export async function GET(req: NextRequest) {
  const configuredSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (!configuredSecret || authHeader !== `Bearer ${configuredSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const period = getPreviousMonthPeriod();
  const month = Number(searchParams.get("month") || period.month);
  const year = Number(searchParams.get("year") || period.year);

  const summary = await generateLoadStatementsForPeriod({ month, year });

  return NextResponse.json({
    success: summary.failed === 0,
    message: "Load statement generation completed",
    ...summary,
  });
}
