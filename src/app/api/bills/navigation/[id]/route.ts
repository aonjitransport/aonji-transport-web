import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from 'lib/mongodb';
import { Bill } from 'models/Bill';
import { Types } from 'mongoose';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid bill ID' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    // Fetch current bill
    const currentBill = await Bill.findById(id);
    if (!currentBill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    const createdAt = currentBill.createdAt;

    // Find previous bill (created before this one)
    const prev = await Bill.findOne({ createdAt: { $lt: createdAt } })
      .sort({ createdAt: -1 })
      .select('_id');

    // Find next bill (created after this one)
    const next = await Bill.findOne({ createdAt: { $gt: createdAt } })
      .sort({ createdAt: 1 })
      .select('_id');

    return NextResponse.json({
      bill: currentBill,
      prevId: prev?._id || null,
      nextId: next?._id || null,
    });
  } catch (error) {
    console.error('Navigation fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
