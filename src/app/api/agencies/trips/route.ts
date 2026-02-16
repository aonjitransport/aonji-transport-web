
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from 'lib/mongodb';
import { Bill } from 'models/Bill';
import { Agency } from 'models/Agency';
import mongoose from 'mongoose';
import  {Trip}  from 'models/Trip';

// POST /api/agencies/trips
// Body: { agencyId, driver, tripId, billIds: [ ... ] }
export async function POST(req: NextRequest) {
  try {
    const {
  agencyId,
  driver,
  billIds,
  totalArticels,
  agencyCharges,
  outStationCharges,
  totalOutStationCharges,
  totalAmount,
  totalUnpaidAmount,
  netPayableAmount,
  grandTotalChargeAmount
} = await req.json();
    if (!agencyId || !driver  || !Array.isArray(billIds) || billIds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Create the trip
    const trip = await Trip.create({
        tripId: new mongoose.Types.ObjectId().toString(),
      driver,
      agency: new mongoose.Types.ObjectId(agencyId),
      bills: billIds.map(id => new mongoose.Types.ObjectId(id)),
        totalArticels,
        agencyCharges,
        outStationCharges,
        totalOutStationCharges,
        totalAmount,
        totalUnpaidAmount,
        netPayableAmount,
        grandTotalChargeAmount,


    });

    // Update each bill: set trip and deliveryStatus
await Bill.updateMany(
  { _id: { $in: billIds } },
  { $set: { trip: trip._id, deliveryStatus: true } }
);

    // Optionally, add the trip to the agency's trips array
    await Agency.findByIdAndUpdate(agencyId, { $push: { trips: trip._id } });

    return NextResponse.json({ trip }, { status: 201 });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}



