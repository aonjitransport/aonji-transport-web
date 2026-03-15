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
      destinationBranch
    } = body;

    if (!destinationBranch || !driver || !bills?.length) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    session.startTransaction();

    const branch = await Branch.findById(destinationBranch).session(session);

    if (!branch) {
      throw new Error("Branch not found");
    }

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

    const [trip] = await Trip.create(
      [
        {
          tripId,
          driver,
          status: "in_transit",
          branch: destinationBranch,
          bills: bills.map((id: string) => new mongoose.Types.ObjectId(id)),

          totalArticels,
          agencyCharges,
          totalAmount,
          totalUnpaidAmount,
          netPayableAmount,
          grandTotalChargeAmount,

          vehicleNumber,

          originBranch,
          destinationBranch,
          destinationBranchName: branch.name,

          createdBy: auth.user.id
        }
      ],
      { session }
    );

    await Bill.updateMany(
      { _id: { $in: bills } },
      { $set: { trip: trip._id, deliveryStatus: true } },
      { session }
    );

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

  } catch (err) {

    await session.abortTransaction();
    session.endSession();

    console.error("Trip creation failed:", err);

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

    const filter: any = {};

    // 🔒 ROLE BASED BRANCH CONTROL
    if (user.role === "agent") {
      // agent always locked to their branch
      filter.branch = new mongoose.Types.ObjectId(user.branchId);
    }

    else if (user.role === "admin") {
      // admin default branch
      if (branch && mongoose.Types.ObjectId.isValid(branch)) {
        filter.branch = new mongoose.Types.ObjectId(branch);
      } else {
        filter.branch = new mongoose.Types.ObjectId(user.branchId);
      }
    }

    else if (user.role === "super_admin") {
      // super_admin optional filter
      if (branch && mongoose.Types.ObjectId.isValid(branch)) {
        filter.branch = new mongoose.Types.ObjectId(branch);
      }
    }

    // 📅 Month + Year filter
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

    const trips = await Trip.find(filter)
.select(
`tripId
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
createdAt
bills`
)
.populate("originBranch", "name city phone")
.populate("destinationBranch", "name city phone")
.populate("bills", "lrNumber totalAmount consigner consignees articles")
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
