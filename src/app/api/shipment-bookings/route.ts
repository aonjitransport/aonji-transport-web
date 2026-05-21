// src/app/api/shipment-bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "lib/mongodb";
import { ShipmentBooking } from "models/ShipmentBooking";
import { requireRole } from "lib/auth";

export const dynamic = "force-dynamic";

function clampInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = value ? Number(value) : NaN;
  if (!Number.isFinite(parsed)) return fallback;
  const intVal = Math.floor(parsed);
  return Math.max(min, Math.min(max, intVal));
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const auth = await requireRole(req, ["admin", "super_admin"]);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const status = (searchParams.get("status") ?? "").trim();
  const page = clampInt(searchParams.get("page"), 1, 1, 10_000);
  const pageSize = clampInt(searchParams.get("pageSize"), 10, 1, 50);

  const filter: Record<string, unknown> = {};

  if (status) {
    filter.status = status;
  }

  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { requestId: regex },
      { shipToLocation: regex },
      { customerName: regex },
      { mobileNumber: regex },
    ];
  }

  const [items, total, newCount] = await Promise.all([
    ShipmentBooking.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    ShipmentBooking.countDocuments(filter),
    ShipmentBooking.countDocuments({ status: "NEW" }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    newCount,
  });
}
