// src/app/api/branches/exclude-user-service-areas/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { Branch } from "../../../../../models/Branch";
import { requireRole } from "../../../../../lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["admin", "agent", "super_admin"]);
  if (auth instanceof Response) return auth;

  await connectToDatabase();

  const { id: userId, role, branchId } = auth.user;

  let userBranches = [];

  // 🔑 ROLE-BASED BRANCH RESOLUTION
  if (role === "agent") {
    // agent → linked via user.branchId
    if (!branchId) {
      return NextResponse.json({ areas: [] });
    }

    userBranches = await Branch.find({
      _id: branchId,
      isActive: true,
    }).select("serviceAreas");

  } else {
    // admin / super_admin → linked via adminIds
    userBranches = await Branch.find({
      isActive: true,
      adminIds: userId,
    }).select("serviceAreas");
  }

  // Collect excluded areas
  const excludedAreas = new Set(
    userBranches.flatMap((b) => b.serviceAreas)
  );

  // All service areas
  const allAreas: string[] = await Branch.distinct("serviceAreas", {
    isActive: true,
  });

  // Remove user's areas
  const filteredAreas = allAreas.filter(
    (area) => !excludedAreas.has(area)
  );

  return NextResponse.json({ areas: filteredAreas });
}
