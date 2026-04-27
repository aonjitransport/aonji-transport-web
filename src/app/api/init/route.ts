// src/app/api/init/route.ts

import { NextResponse } from "next/server";
import { initSuperAdmin } from "../../../../lib/initSuperAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  // ❌ Prevent running during build
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ message: "Skipped (no env)" });
  }

  await initSuperAdmin();

  return NextResponse.json({ message: "Init done" });
}