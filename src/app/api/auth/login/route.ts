import { connectToDatabase } from "lib/mongodb";
import { User } from "models/User";
import bcrypt from "bcryptjs";
import { signToken } from "lib/jwt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { loginId, password } = body;

    if (!loginId || !password) {
      return NextResponse.json(
        { error: "loginId and password are required" },
        { status: 400 }
      );
    }

    // 🔒 Explicitly select password
    const user = await User.findOne({ loginId })
      .select("+password")
      .exec();

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is disabled" },
        { status: 403 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🔑 Minimal JWT payload
    const token = await signToken({
      id: user.id.toString(),
      role: user.role,
    });

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(),
        name: user.name,
        role: user.role,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("LOGIN API ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
