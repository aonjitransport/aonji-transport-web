// src/app/api/branches/exclude-user-branch/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { Branch } from "../../../../../models/Branch";
import { requireRole } from "../../../../../lib/auth";

export async function GET(req: NextRequest) {
  // 1️⃣ Auth check
  const auth = await requireRole(req, ["admin", "agent", "super_admin"]);
  if (auth instanceof Response) return auth;

  const userBranchId = auth.user.branchId;

  if (!userBranchId) {
    // If user has no branch assigned, return all active branches
    await connectToDatabase();
    const branches = await Branch.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json({ branches });

  }

  await connectToDatabase();

  // 2️⃣ Get all branches except user's branch
  const branches = await Branch.find({
    isActive: true,
    _id: { $ne: userBranchId },
  }).sort({ name: 1 });

  return NextResponse.json({ branches });
}
