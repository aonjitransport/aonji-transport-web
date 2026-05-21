// src/app/api/shipment-bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "lib/mongodb";
import { ShipmentBooking } from "models/ShipmentBooking";
import { requireRole } from "lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = new Set(["NEW", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  await connectToDatabase();

  const auth = await requireRole(req, ["admin", "super_admin"]);
  if (auth instanceof NextResponse) return auth;

  const id = context.params.id;
  const body = await req.json().catch(() => ({}));
  const nextStatus = String(body?.status ?? "").trim();

  if (!ALLOWED_STATUSES.has(nextStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await ShipmentBooking.findByIdAndUpdate(
    id,
    { $set: { status: nextStatus } },
    { new: true }
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
