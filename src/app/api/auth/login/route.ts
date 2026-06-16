import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "../../../../../lib/mongodb";
import { User,IUser } from "../../../../../models/User";
import { signToken } from "../../../../../lib/jwt";

const REMEMBER_ME_MAX_AGE = 60 * 60 * 24 * 30;

function isHttpsRequest(req: Request) {
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();

  if (forwardedProto) {
    return forwardedProto === "https";
  }

  return new URL(req.url).protocol === "https:";
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { loginId, password, rememberMe } = await req.json();

    if (!loginId || !password) {
      return NextResponse.json(
        { error: "LoginId and password required" },
        { status: 400 }
      );
    }

     if (!loginId || !password) return NextResponse.json({ error: "Missing credentials" }, { status: 400 });

     

  

    // 🔍 find user
    const user = (await User.findOne({ loginId })
      .select("+password")
      .exec()) as IUser | null;

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🔐 create JWT
    const token = await signToken({
  id: user._id.toString(),
  role: user.role,
  branchId: user.branchId?.toString(), // 👈 THIS is the key
});

  const res = NextResponse.json({
  success: true,
  token,
  user: {
    id: user._id.toString(),
    name: user.name,
    role: user.role,
    branchId: user.branchId?.toString() || null,
  },
});

    // 🍪 cookie used by middleware
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: isHttpsRequest(req),
      sameSite: "lax",
      path: "/",
      ...(rememberMe ? { maxAge: REMEMBER_ME_MAX_AGE } : {}),
    });

    return res;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
