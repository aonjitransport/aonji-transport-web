// src/app/api/shipment-bookings/count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "lib/mongodb";
import { ShipmentBooking } from "models/ShipmentBooking";
import { requireRole } from "lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const auth = await requireRole(req, ["admin", "super_admin"]);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") ?? "").trim();

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const count = await ShipmentBooking.countDocuments(filter);
  return NextResponse.json({ count });
}
