import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "lib/mongodb";
import { User } from "../../../../../models/User"
import bcrypt from "bcryptjs";
import { requireRole } from "lib/auth"

// ──────────────────────────────
// 👑 POST /api/auth/register → Super Admin only
// ──────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 🔒 Only super_admin allowed
    const auth = await requireRole(req, ["super_admin"]);
    if (auth instanceof NextResponse) return auth;

    await connectToDatabase();

    const { name, loginId, password } = await req.json();

    if (!name || !loginId || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // 🚫 Check duplicate
    const existing = await User.findOne({ loginId });
    if (existing) {
      return NextResponse.json(
        { error: "Login ID already exists" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      loginId,
      password: hashed,
      role: "admin",
      createdBy: auth.user.id, // 👈 track who created
    });

    return NextResponse.json({
      success: true,
      message: "Admin created successfully",
    });

  } catch (error) {
    console.error("ADMIN REGISTER ERROR:", error);
    return NextResponse.json(
      { error: "Error creating admin" },
      { status: 500 }
    );
  }
}
