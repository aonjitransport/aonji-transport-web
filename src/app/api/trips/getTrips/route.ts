//api/trips/getTrips/route.ts

// src/app/api/trips/getTrips/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/../../lib/mongodb";
import { requireRole } from "@/../../lib/auth";
import { Trip } from "@../../models/Trip";

// GET /api/trips/getTrips?branchId=xxx&status=COMPLETED&timeRange=all&role=origin|destination|both
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  await connectToDatabase();

  const auth = await requireRole(req, ["admin", "super_admin", "agent"]);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branchId");
  const status = searchParams.get("status");         // COMPLETED | IN_TRANSIT | REACHED | PENDING | all
  const timeRange = searchParams.get("timeRange");   // all | today | week | month | year
  const role = searchParams.get("role") || "both";   // origin | destination | both

  if (!branchId) {
    return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  }

  // Build branch filter — whether to look at origin, destination, or both
  let branchFilter: object;
  if (role === "origin") {
    branchFilter = { originBranch: branchId };
  } else if (role === "destination") {
    branchFilter = { destinationBranch: branchId };
  } else {
    branchFilter = {
      $or: [
        { originBranch: branchId },
        { destinationBranch: branchId },
      ],
    };
  }

  // Build status filter
  const statusFilter: object =
    status && status !== "all" ? { status: status.toUpperCase() } : {};

  // Build date filter based on timeRange
  let dateFilter: object = {};
  const now = new Date();
  if (timeRange === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    dateFilter = { createdAt: { $gte: start } };
  } else if (timeRange === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    dateFilter = { createdAt: { $gte: start } };
  } else if (timeRange === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    dateFilter = { createdAt: { $gte: start } };
  } else if (timeRange === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    dateFilter = { createdAt: { $gte: start } };
  }

  const query = {
    ...branchFilter,
    ...statusFilter,
    ...dateFilter,
  };

  const trips = await Trip.find(query)
    .sort({ createdAt: -1 })
    .populate("originBranch", "name city code")
    .populate("destinationBranch", "name city code")
    .populate("createdBy", "name role")
    .lean();

  // Summary stats for the dashboard
  const totalTrips = trips.length;
  const completed = trips.filter((t) => t.status === "COMPLETED").length;
  const inTransit = trips.filter((t) => t.status === "IN_TRANSIT").length;
  const pending = trips.filter((t) => t.status === "PENDING").length;
  const reached = trips.filter((t) => t.status === "REACHED").length;

  const totalRevenue = trips.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const totalUnpaid = trips.reduce((sum, t) => sum + (t.totalUnpaidAmount || 0), 0);
  const netPayable = trips.reduce((sum, t) => sum + (t.netPayableAmount || 0), 0);
  const totalArticles = trips.reduce((sum, t) => sum + (t.totalArticels || 0), 0);

  return NextResponse.json({
    trips,
    summary: {
      totalTrips,
      completed,
      inTransit,
      pending,
      reached,
      totalRevenue,
      totalUnpaid,
      netPayable,
      totalArticles,
    },
  });
}