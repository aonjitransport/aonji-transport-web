import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "../../../../lib/mongodb";
import { Trip } from "../../../../models/Trip";
import { Bill } from "../../../../models/Bill";
import { Branch } from "models/Branch";
import { Counter } from "../../../../models/Counter";
import { requireRole } from "lib/auth";

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const session = await mongoose.startSession();

  try {
    const auth = await requireRole(req, ["admin", "super_admin", "agent"]);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();

    const {
      driver,
      bills,
      totalArticels,
      agencyCharges,
      totalAmount,
      totalUnpaidAmount,
      netPayableAmount,
      grandTotalChargeAmount,
      vehicleNumber,
      originBranch,
      destinationBranch,
      addedToTripFlag

    } = body;

    if (!destinationBranch || !driver || !bills?.length) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    session.startTransaction();

    // ✅ prevent adding already assigned bills
    const existingBills = await Bill.find({
      _id: { $in: bills },
      trip: { $ne: null }
    }).session(session);

    if (existingBills.length > 0) {
      throw new Error("Some bills are already assigned to a trip");
    }

    const branch = await Branch.findById(destinationBranch).session(session);
    if (!branch) throw new Error("Branch not found");

    const branchCode = branch.code;
    const year = new Date().getFullYear();

    const counterKey = `trip-${branchCode}-${year}`;

    const counter = await Counter.findOneAndUpdate(
      { key: counterKey },
      { $inc: { seq: 1 }, $setOnInsert: { key: counterKey } },
      { new: true, upsert: true, session }
    );

    const serial = String(counter.seq).padStart(3, "0");
    const tripId = `TS-${branchCode}-${year}-${serial}`;

    const agencyEarning = agencyCharges?.chargeAmount || 0;
    const companyEarning = netPayableAmount || 0;

    // ✅ CREATE TRIP (PLANNED)
    const [trip] = await Trip.create(
      [
        {
          tripId,
          driver,
          status: "PLANNED", // ✅ FIXED

          bills: bills.map((id: string) => new mongoose.Types.ObjectId(id)),

          totalArticels,
          agencyCharges,
          totalAmount,
          totalUnpaidAmount,
          netPayableAmount,
          grandTotalChargeAmount,
          addedToTripFlag,

          vehicleNumber,

          originBranch,
          destinationBranch,
          destinationBranchName: branch.name,

          createdBy: auth.user.id
        }
      ],
      { session }
    );

    // ✅ UPDATE BILLS
    await Bill.updateMany(
      { _id: { $in: bills } },
      {
        $set: {
          trip: trip._id,
          status: "ADDED_TO_TRIP",
          currentLocation: "Origin Branch" ,// ✅ FIXED
          addedToTripFlag: true // ✅ NEW FLAG
        },
        $push: {
          statusHistory: {
            status: "ADDED_TO_TRIP",
            date: new Date(),
            updatedBy: auth.user.id
          }
        }
        
      },
      { session }
    );

    // ✅ UPDATE BRANCH STATS
    await Branch.findByIdAndUpdate(
      destinationBranch,
      {
        $push: { trips: trip._id },
        $inc: {
          totalTrips: 1,
          totalTripAmount: totalAmount || 0,
          totalAgencyEarnings: agencyEarning,
          totalCompanyEarnings: companyEarning
        }
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(trip, { status: 201 });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Trip creation failed:", error);

    return NextResponse.json(
      { error: "Failed to create trip" },
      { status: 500 }
    );
  }
}










export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await requireRole(req, ["super_admin", "admin", "agent"]);
    if (auth instanceof NextResponse) return auth;

    const user = auth.user;

    const { searchParams } = new URL(req.url);

    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const branch = searchParams.get("branch");
    const direction = searchParams.get("direction");

    const filter: any = {};

    /* ---------------- DATE FILTER ---------------- */
    const monthNames = [
      "january","february","march","april","may","june",
      "july","august","september","october","november","december"
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

    const selectedBranch =
      branch && mongoose.Types.ObjectId.isValid(branch)
        ? new mongoose.Types.ObjectId(branch)
        : null;

    /* ---------------- ROLE + DIRECTION ---------------- */

    if (user.role === "super_admin") {
      if (direction === "OUTGOING") {
        if (selectedBranch) filter.originBranch = selectedBranch;
      } 
      else if (direction === "INCOMING") {
        if (selectedBranch) filter.destinationBranch = selectedBranch;
      } 
      else {
        if (selectedBranch) {
          filter.$or = [
            { originBranch: selectedBranch },
            { destinationBranch: selectedBranch },
          ];
        }
      }
    } else {
      const userBranchId = new mongoose.Types.ObjectId(user.branchId);

      if (direction === "OUTGOING") {
        filter.originBranch = userBranchId;

        // ✅ ONLY apply if DIFFERENT branch selected
        if (
          selectedBranch &&
          selectedBranch.toString() !== userBranchId.toString()
        ) {
          filter.destinationBranch = selectedBranch;
        }
      } 
      
      else if (direction === "INCOMING") {
        filter.destinationBranch = userBranchId;

        // ✅ ONLY apply if DIFFERENT branch selected
        if (
          selectedBranch &&
          selectedBranch.toString() !== userBranchId.toString()
        ) {
          filter.originBranch = selectedBranch;
        }
      } 
      
      else {
        filter.$or = [
          { originBranch: userBranchId },
          { destinationBranch: userBranchId },
        ];
      }
    }

    /* ---------------- QUERY ---------------- */

    const trips = await Trip.find(filter)
      .select(`
        tripId
        driver
        vehicleNumber
        originBranch
        destinationBranch
        destinationBranchName
        totalArticels
        totalAmount
        totalUnpaidAmount
        netPayableAmount
        agencyCharges
        grandTotalChargeAmount
        status
        createdAt
        bills
      `)
      .populate("originBranch", "name city phone")
      .populate("destinationBranch", "name city phone")
      .populate("bills", "lrNumber totalAmount status")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(trips);

  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}