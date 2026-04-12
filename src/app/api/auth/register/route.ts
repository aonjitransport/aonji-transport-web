// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "lib/mongodb";
import { requireRole } from "lib/auth";
import { User } from "../../../../../models/User";
import { Branch } from "../../../../../models/Branch";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["super_admin"]);
    if (auth instanceof NextResponse) return auth;

    await connectToDatabase();

    const {
      name,
      loginId,
      password,
      branchMode,     // "NEW" | "EXISTING"
      branchId,
      branchData,
    } = await req.json();

    if (!name || !loginId || !password || !branchMode) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const exists = await User.findOne({ loginId });
    if (exists) {
      return NextResponse.json({ error: "Login ID exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    // 1️⃣ Create admin WITHOUT branch first
    const adminUser = await User.create({
      name,
      loginId,
      password: hashed,
      role: "admin",
      createdBy: auth.user.id,
    });

    let finalBranchId: mongoose.Types.ObjectId;

    // 2️⃣ Branch handling
    if (branchMode === "NEW") {
      if (!branchData?.name || !branchData?.city) {
        return NextResponse.json(
          { error: "Branch data required" },
          { status: 400 }
        );
      }

      const branch = await Branch.create({
        ...branchData,
        adminIds: [adminUser._id], // 👈 supports MULTIPLE admins
        type: "OWN",
      });

      finalBranchId = branch._id as mongoose.Types.ObjectId;

    } else {
      if (!branchId) {
        return NextResponse.json(
          { error: "branchId required" },
          { status: 400 }
        );
      }

      const branch = await Branch.findById(branchId);
      if (!branch) {
        return NextResponse.json(
          { error: "Invalid branchId" },
          { status: 404 }
        );
      }

      finalBranchId = branch._id as mongoose.Types.ObjectId;

      // optional: push admin into branch admins
      await Branch.updateOne(
        { _id: finalBranchId },
        { $addToSet: { adminIds: adminUser._id } }
      );
    }

    // 3️⃣ Link admin → branch
    adminUser.branchId = finalBranchId;
    await adminUser.save();

    return NextResponse.json({
      success: true,
      message: "Admin created & linked to branch",
      adminId: adminUser._id,
      branchId: finalBranchId,
    });

  } catch (err) {
    console.error("ADMIN REGISTER ERROR:", err);
    return NextResponse.json(
      { error: "Admin creation failed" },
      { status: 500 }
    );
  }
}
