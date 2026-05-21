// src/app/api/public/shipment-bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "lib/mongodb";
import { ShipmentBooking } from "models/ShipmentBooking";
import { Counter } from "models/Counter";

export const dynamic = "force-dynamic";

function isValidIndianMobile10Digits(value: string) {
  return /^\d{10}$/.test(value);
}

async function nextRequestId() {
  const counter = await Counter.findOneAndUpdate(
    { key: "shipment_booking_request" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).lean();

  const seq = Number((counter as any)?.seq ?? 0);
  return `BR-${String(seq).padStart(5, "0")}`;
}

function parsePositiveInt(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value >= 1) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed >= 1) return parsed;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const shipToLocation = String(body?.shipToLocation ?? "").trim();
    const customerName = String(body?.customerName ?? "").trim();
    const mobileNumber = String(body?.mobileNumber ?? "").trim();
    const goodsType = String(body?.goodsType ?? "").trim();
    const goodsQuantity = parsePositiveInt(body?.goodsQuantity);

    if (!shipToLocation) {
      return NextResponse.json({ error: "Ship to location is required" }, { status: 400 });
    }
    if (!customerName) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!isValidIndianMobile10Digits(mobileNumber)) {
      return NextResponse.json({ error: "Mobile number must be 10 digits" }, { status: 400 });
    }
    if (!goodsQuantity) {
      return NextResponse.json({ error: "Goods quantity must be at least 1" }, { status: 400 });
    }
    if (!goodsType) {
      return NextResponse.json({ error: "Goods type is required" }, { status: 400 });
    }

    const requestId = await nextRequestId();

    const booking = await ShipmentBooking.create({
      requestId,
      shipToLocation,
      customerName,
      mobileNumber,
      goodsQuantity,
      goodsType,
      source: "landing",
    });

    return NextResponse.json(
      {
        id: String(booking._id),
        requestId,
        status: booking.status,
        createdAt: booking.createdAt,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Public shipment booking error:", err);
    return NextResponse.json(
      { error: "Failed to submit booking" },
      { status: 500 }
    );
  }
}
