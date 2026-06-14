// api/load-statements/auto-generate/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import {
  generateLoadStatementsForPeriod,
  getPreviousMonthPeriod,
} from "../../../../../lib/loadStatementGenerator";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const period = getPreviousMonthPeriod();
    const month = Number(searchParams.get("month") || period.month);
    const year = Number(searchParams.get("year") || period.year);
    const summary = await generateLoadStatementsForPeriod({ month, year });

    return NextResponse.json({
      success: summary.failed === 0,
      message: "Auto generation complete",
      ...summary,
    });

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      { error: "Auto generation failed" },
      { status: 500 }
    );
  }
}
