import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { Branch } from "../../../../../models/Branch";
import { requireRole } from "../../../../../lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["admin", "agent", "super_admin"]);
  if (auth instanceof NextResponse) return auth;

  const area = req.nextUrl.searchParams.get("area");

  if (!area) {
    return NextResponse.json([], { status: 200 });
  }

  await connectToDatabase();

  const branches = await Branch.find({
    serviceAreas: { $in: [area] },
    isActive: true,
  }).lean();

  return NextResponse.json(branches);
}
