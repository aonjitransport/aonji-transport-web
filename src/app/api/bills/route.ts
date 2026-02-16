import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { Bill } from '../../../../models/Bill';
import  { requireRole } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    // 🛡 Require admin only
    const auth = await requireRole(req, ["admin"]);
    if (auth instanceof NextResponse) return auth;

    const data = await req.json();
    await connectToDatabase();

    const newBill = await Bill.create(data);
    return NextResponse.json(newBill, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating bill" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const to = searchParams.get('to');
    const deliveryStatus = searchParams.get('deliveryStatus');
    const agencyName = searchParams.get('agencyName');

    const filter: any = {};
    if (to) filter.to = to;
    if (deliveryStatus) filter.deliveryStatus = deliveryStatus;

    if (agencyName) {
      filter['agency.name'] = { $regex: new RegExp(agencyName, 'i') };
    }

    // Date filtering
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];

    if (year && month) {
      const m = monthNames.findIndex(mn => mn === month.toLowerCase());
      const y = parseInt(year);
      if (m !== -1 && !isNaN(y)) {
        const start = new Date(Date.UTC(y, m, 1));
        const end = new Date(Date.UTC(y, m + 1, 1));
        filter.createdAt = { $gte: start, $lt: end };
      }
    }

    const bills = await Bill.find(filter);
    return NextResponse.json(bills);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching bills' }, { status: 500 });
  }
}
