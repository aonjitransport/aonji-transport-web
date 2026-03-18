import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicRoutes = ["/", "/about", "/contact"];

  const agentBlockedPaths = [
  "/admin/agencies",
  "/admin/users",
  "/admin/settings",
];

  // 🟢 Public / ignored routes
  if (
  publicRoutes.includes(pathname) ||
  pathname.startsWith("/_next") ||
  pathname.match(/\.(css|js|png|jpg|svg|ico)$/) ||
  pathname.startsWith("/admin/login") ||
  pathname.startsWith("/api/auth")
) {
  return NextResponse.next();
}

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    // 🔒 AGENT BLOCK
 if (
  role === "agent" &&
  agentBlockedPaths.some(
    (path) => pathname === path // exact match only
  )
) {
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}
