export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { Branch } from "../../../../models/Branch";
import { User } from "../../../../models/User";
import bcrypt from "bcryptjs";
import { requireRole } from "../../../../lib/auth";

/* =========================
   GET ALL BRANCHES
========================= */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["admin", "super_admin","agent"]);
  if (auth instanceof NextResponse) return auth;

  await connectToDatabase();
  const branches = await Branch.find().lean();
  return NextResponse.json(branches);
}






/* =========================
   CREATE BRANCH + USER
========================= */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["admin", "super_admin"]);
    if (auth instanceof NextResponse) return auth;

    await connectToDatabase();

    const body = await req.json();
    const { branch, loginId, password } = body;

    // 🔴 BASIC VALIDATION
    if (!branch?.name || !branch?.city) {
      return NextResponse.json(
        { error: "Branch name and city are required" },
        { status: 400 }
      );
    }

    if (!loginId || !password) {
      return NextResponse.json(
        { error: "Login ID and password required" },
        { status: 400 }
      );
    }

    // 🔴 CHECK DUPLICATE BRANCH CODE 
    const existingBranch = await Branch.findOne({ code: branch.code });
    if (existingBranch) {
      return NextResponse.json( 
        { error: "Branch code already exists" },
        { status: 400 }
      );
    }

    // 🔴 CHECK DUPLICATE USER
    const existingUser = await User.findOne({ loginId });
    if (existingUser) {
      return NextResponse.json(
        { error: "Login ID already exists" },
        { status: 400 }
      );
    }

    // ✅ CREATE BRANCH
    const newBranch = await Branch.create({
      name: branch.name,
      city: branch.city.toLowerCase(),
      serviceAreas: branch.serviceAreas || [],
      phone: branch.phone,
      address: branch.address,
      code: branch.code,
      adminIds: [auth.user.id],
      type: branch.type   || "AGENT" , // 🔥 MUST MATCH ENUM
    });

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ CREATE USER
    const user = await User.create({
      loginId,
      name: branch.name,
      password: hashedPassword,
      role: "agent",
      branchId: newBranch._id,
      createdBy: auth.user.id,
    });

    // 🔁 LINK USER TO BRANCH
    newBranch.userId = user._id;
    await newBranch.save();

    return NextResponse.json({
      success: true,
      branch: newBranch,
      user: {
        id: user._id,
        loginId: user.loginId,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("BRANCH + USER CREATE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create branch" },
      { status: 500 }
    );
  }
}
