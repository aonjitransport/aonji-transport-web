import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { Bill } from '../../../../models/Bill';
import  { requireRole } from '../../../../lib/auth';





export async function POST(req: NextRequest) {
  try {
    // 🛡 Require admin only
    const auth = await requireRole(req, ["admin", "super_admin","agent"  ]);
    if (auth instanceof NextResponse) return auth;

    const data = await req.json();
    await connectToDatabase();

    const newBill = await Bill.create({
      ...data,
      createdBy: auth.user.id,   // ✅ THIS WAS MISSING
    });
    const populatedBill = await Bill.findById(newBill._id)
                  .populate("fromBranch", "name city phone address")
                  .populate("toBranch", "name city phone address")
                  .populate("createdBy", "name role")
                  .lean();

    return NextResponse.json(populatedBill, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating bill" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // 🛡 Auth
    const auth = await requireRole(req, ["super_admin", "admin", "agent"]);
    if (auth instanceof NextResponse) return auth;

    const user = auth.user; // { id, role, branchId }

    const { searchParams } = new URL(req.url);

    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const to = searchParams.get("to");
    const fromBranch = searchParams.get("fromBranch");
    const toBranch = searchParams.get("toBranch");
    const deliveryStatus = searchParams.get("deliveryStatus");
    const direction = searchParams.get("direction"); // 👈 NEW

    const filter: any = {};

    /* ---------------- BASIC FILTERS ---------------- */
    if (to) filter.to = to;

    if (deliveryStatus !== null) {
      filter.deliveryStatus = deliveryStatus === "true";
    }

    /* ---------------- DATE FILTER ---------------- */
    const monthNames = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december",
    ];

    if (year && month) {
      const m = monthNames.indexOf(month.toLowerCase());
      const y = Number(year);

      if (m !== -1 && !isNaN(y)) {
        const start = new Date(Date.UTC(y, m, 1));
        const end = new Date(Date.UTC(y, m + 1, 1));
        filter.createdAt = { $gte: start, $lt: end };
      }
    }

    /* ---------------- ROLE + DIRECTION LOGIC ---------------- */

    /* ---------------- ROLE + DIRECTION LOGIC ---------------- */

if (user.role === "super_admin") {

  if (direction === "OUTGOING") {
    if (fromBranch) filter.fromBranch = fromBranch;
  } 
  else if (direction === "INCOMING") {
    if (toBranch) filter.toBranch = toBranch;
  } 
  else {
    if (fromBranch) filter.fromBranch = fromBranch;
    if (toBranch) filter.toBranch = toBranch;
  }

} else {

  const userBranchId = user.branchId;

  if (direction === "OUTGOING") {
    filter.fromBranch = userBranchId;

    if (toBranch) filter.toBranch = toBranch; // optional destination filter
  } 
  
  else if (direction === "INCOMING") {
    filter.toBranch = userBranchId;

    // ✅ apply selected agency filter properly
  if (toBranch) {
    filter.fromBranch = toBranch; // 👈 THIS IS THE FIX
  }
  } 
  
  else {
    filter.$or = [
      { fromBranch: userBranchId },
      { toBranch: userBranchId },
    ];
  }
}

    /* ---------------- QUERY ---------------- */
    const bills = await Bill.find(filter)
      .populate("fromBranch", "name city phone address")
      .populate("toBranch", "name city phone address")
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 })
      .lean();

    if (!bills) {
      return NextResponse.json({ error: "No bills found" }, { status: 404 });
    } 
    return NextResponse.json(bills, { status: 200 });

  } catch (error) {
    console.error("GET BILLS ERROR:", error);
    return NextResponse.json(
      { error: "Error fetching bills" },
      { status: 500 }
    );
  }
}