// src/app/api/init/route.ts
import { NextResponse } from "next/server";
import { initSuperAdmin } from "../../../../lib/initSuperAdmin";

export async function GET() {
  await initSuperAdmin();
  return NextResponse.json({ message: "Init done" });
}