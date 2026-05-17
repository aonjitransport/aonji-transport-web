import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { requireRole } from "../../../../lib/auth";
import { LoadStatement, ILoadStatement } from "../../../../models/LoadStatement";

const MONTH_MAP: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4,
  may: 5, june: 6, july: 7, august: 8,
  september: 9, october: 10, november: 11, december: 12,
};

function parseMonth(value: string | null): number | null {
  if (!value || value === "Month") return null;
  // If it's already a numeric string like "2"
  const asNum = Number(value);
  if (!isNaN(asNum) && asNum >= 1 && asNum <= 12) return asNum;
  // If it's a name like "February"
  const mapped = MONTH_MAP[value.toLowerCase()];
  return mapped ?? null;
}

function parseYear(value: string | null): number | null {
  if (!value || value === "Year") return null;
  const asNum = Number(value);
  return !isNaN(asNum) ? asNum : null;
}

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["admin", "super_admin", "agent"]);
  if (auth instanceof NextResponse) return auth;

  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branchId");

  if (!branchId) {
    return NextResponse.json({ error: "branchId required" }, { status: 400 });
  }

  const month = parseMonth(searchParams.get("month"));
  const year = parseYear(searchParams.get("year"));

  const query: any = { branch: branchId };
  if (month !== null) query.month = month;
  if (year !== null) query.year = year;

  const statements = await LoadStatement.find(query)
    .sort({ year: -1, month: -1 })
    .lean();

  return NextResponse.json(statements);
}