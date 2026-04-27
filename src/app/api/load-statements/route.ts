import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { requireRole } from "../../../../lib/auth";
import { LoadStatement,ILoadStatement } from "../../../../models/LoadStatement";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["admin", "super_admin", "agent"]);
  if (auth instanceof NextResponse) return auth;

  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branchId");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  if (!branchId) {
    return NextResponse.json({ error: "branchId required" }, { status: 400 });
  }

  const query: any = { branch: branchId };

  // month filter — only if both provided
  if (month && month !== "Month") query.month = Number(month);
  if (year && year !== "Year") query.year = Number(year);

  const statements = await LoadStatement.find(query)
    .sort({ year: -1, month: -1 })
    .lean();

  return NextResponse.json(statements);
}