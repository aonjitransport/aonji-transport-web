import { NextResponse } from "next/server";

export async function POST() {
  // Create response
  const res = NextResponse.json({ success: true, message: "Logged out successfully" });

  // Clear the auth token cookie
  res.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // instantly expires
  });

  return res;
}
