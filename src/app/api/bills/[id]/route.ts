import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from 'lib/mongodb';
import { Bill } from 'models/Bill';
import { Types } from 'mongoose';
import { requireRole } from 'lib/auth';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  // “params” is a Promise-like object now, so await it:
  const { id } = await context.params;

  // (the rest of your logic stays the same)
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid bill ID" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const bill = await Bill.findById(id);
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }
    return NextResponse.json(bill);
  } catch (error) {
    console.error("Error in GET /api/bills/[id]:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } =await context.params;

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid bill ID" }, { status: 400 });
  }

  try {
    // 🛡 Require authorization (admin only)
    const auth = await requireRole(req, ['admin']);
    if (auth instanceof NextResponse) return auth;

    await connectToDatabase();
    const body = await req.json();
    const updatedBill = await Bill.findByIdAndUpdate(id, body, { new: true });
    if (!updatedBill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }
    return NextResponse.json(updatedBill);
  } catch (error) {
    console.error("Error in PATCH /api/bills/[id]:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
