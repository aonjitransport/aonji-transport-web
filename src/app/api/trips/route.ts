import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { Bill } from '../../../../models/Bill';
import { Agency } from '../../../../models/Agency';
import mongoose from 'mongoose';
import { Trip } from '../../../../models/Trip';
import { requireRole } from 'lib/auth';

export async function POST(req: NextRequest) {
  try {

    // 🛡 Require authorization (admin only)
    const auth = await requireRole(req, ['admin']);
    if (auth instanceof NextResponse) return auth;


    const {
      driver,
      bills,
      totalArticels,
      agencyCharges,
      agencyName,
      agencyId,
      totalAmount,
      totalUnpaidAmount,
      netPayableAmount,
      grandTotalChargeAmount
    } = await req.json();

    if (!agencyId || !driver || !Array.isArray(bills) || bills.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // 1️⃣ Generate Trip Sheet ID
    const currentYear = new Date().getFullYear();

    // Count trips created in the current year
    const tripsThisYearCount = await Trip.countDocuments({
      createdAt: {
        $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
        $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
      }
    });

    const serialNum = String(tripsThisYearCount + 1).padStart(3, '0'); // e.g., 001, 002
    const tripSheetId = `TS-${currentYear}-${serialNum}`;

    // 2️⃣ Create the trip
   const trip = await Trip.create({
  tripId: `TS-${currentYear}-${serialNum}`, // ✅ your readable ID
  driver,
  agency: new mongoose.Types.ObjectId(agencyId),
  bills: bills.map(id => new mongoose.Types.ObjectId(id)),
  totalArticels,
  agencyCharges,
  agencyName,
  totalAmount,
  totalUnpaidAmount,
  netPayableAmount,
  grandTotalChargeAmount,
});

    console.log("Creating trip with:", { agencyId, agencyName, tripSheetId });

    // Update each bill: set trip and deliveryStatus
    await Bill.updateMany(
      { _id: { $in: bills } },
      { $set: { trip: trip._id, deliveryStatus: true } }
    );

    // Optionally, add the trip to the agency's trips array
    await Agency.findByIdAndUpdate(agencyId, { $push: { trips: trip._id } });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const agency = searchParams.get("agency"); // 👈 we use _id now

    const filter: any = {};

    // ✅ Filter by agency _id
    if (agency && mongoose.Types.ObjectId.isValid(agency)) {
      filter.agency = new mongoose.Types.ObjectId(agency);
    }

    // ✅ Month + Year filter
    const monthNames = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ];

    if (year && month) {
      const m = monthNames.findIndex((mn) => mn === month.toLowerCase());
      const y = parseInt(year);
      if (m !== -1 && !isNaN(y)) {
        const start = new Date(Date.UTC(y, m, 1));
        const end = new Date(Date.UTC(y, m + 1, 1));
        filter.createdAt = { $gte: start, $lt: end };
      }
    }

    const trips = await Trip.find(filter)
      .populate("agency", "name city")
      .populate("bills")
      .sort({ createdAt: -1 });

    return NextResponse.json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}