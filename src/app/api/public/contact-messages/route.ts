// src/app/api/public/contact-messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "lib/mongodb";
import { ContactMessage } from "models/ContactMessage";
import { Counter } from "models/Counter";

export const dynamic = "force-dynamic";

function isValidIndianMobile10Digits(value: string) {
  return /^\d{10}$/.test(value);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function nextMessageId() {
  const counter = await Counter.findOneAndUpdate(
    { key: "contact_message" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).lean();

  const seq = Number((counter as any)?.seq ?? 0);
  return `CM-${String(seq).padStart(5, "0")}`;
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const name = String(body?.name ?? "").trim();
    const phoneNumber = String(body?.phoneNumber ?? "").replace(/\D/g, "").slice(0, 10);
    const email = String(body?.email ?? "").trim().toLowerCase();
    const message = String(body?.message ?? "").trim();

    if (name.length < 2) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!isValidIndianMobile10Digits(phoneNumber)) {
      return NextResponse.json({ error: "Phone number must be 10 digits" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 });
    }

    const messageId = await nextMessageId();

    const contactMessage = await ContactMessage.create({
      messageId,
      name,
      phoneNumber,
      email,
      message,
      source: "contact",
    });

    return NextResponse.json(
      {
        id: String(contactMessage._id),
        messageId,
        status: contactMessage.status,
        createdAt: contactMessage.createdAt,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Public contact message error:", err);
    return NextResponse.json(
      { error: "Failed to submit message" },
      { status: 500 }
    );
  }
}
