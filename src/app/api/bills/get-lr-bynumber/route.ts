import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { requireRole } from "../../../../../lib/auth";
import { Bill } from "../../../../../models/Bill";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["admin", "super_admin", "agent"]);
  if (auth instanceof NextResponse) return auth;

  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const lrNumber = searchParams.get("lrNumber")?.trim();

  if (!lrNumber) {
    return NextResponse.json({ error: "lrNumber is required" }, { status: 400 });
  }

  const bill = await Bill.findOne({ lrNumber })
    .populate("consigner", "name")
    .populate("consignees", "name type")
    .populate("fromBranch", "name city")
    .populate("toBranch", "name city")
    .lean();

  if (!bill) {
    return NextResponse.json({ error: `No bill found with LR number "${lrNumber}"` }, { status: 404 });
  }

  return NextResponse.json(bill, { status: 200 });
}