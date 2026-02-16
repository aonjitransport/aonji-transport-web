// src/app/api/agencies/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { Agency } from "../../../../models/Agency";
import { requireRole } from "../../../../lib/auth";
import { User } from "../../../../models/User";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["admin", "super_admin"]);
  if (auth instanceof NextResponse) return auth;

  await connectToDatabase();
  const agencies = await Agency.find().lean();

  return NextResponse.json(agencies);
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["admin", "super_admin"]);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { loginId, password, agency } = body;

  if (!loginId || !password || !agency) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  // ❌ Prevent duplicate loginId
  const existingUser = await User.findOne({ loginId });
  if (existingUser) {
    return NextResponse.json(
      { error: "Agent login already exists" },
      { status: 409 }
    );
  }

  // 🔐 Create Agent User
  const hashedPassword = await bcrypt.hash(password, 10);

  const agentUser = await User.create({
    loginId,
    name  : agency.name,
    password: hashedPassword,
    role: "agent",
    createdBy: auth.user.id,
  });

  // 🏢 Create Agency
  const newAgency = await Agency.create({
    ...agency,
    userId: agentUser._id,
  });

  return NextResponse.json(
    { agency: newAgency },
    { status: 201 }
  );
}