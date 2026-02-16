// lib/auth.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, AppJwtPayload } from "./jwt";

export async function requireRole(
  req: NextRequest,
  roles: Array<AppJwtPayload["role"]>
) {
  let token =
    req.headers.get("authorization")?.split(" ")[1] ??
    req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const user = await verifyToken(token);

    if (!roles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return { user };
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}
