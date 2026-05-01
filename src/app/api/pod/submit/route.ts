// src/app/api/pod/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { requireRole } from "../../../../../lib/auth";
import { Pod } from "../../../../../models/Pod";
import { AppJwtPayload } from "../../../../../lib/jwt";

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const auth = await requireRole(req, ["admin", "super_admin", "agent"]);
  if (auth instanceof NextResponse) return auth;

  const user = (auth as { user: AppJwtPayload }).user;
  const {  images, notes } = await req.json();

  if (!images?.length) {
    return NextResponse.json({ error: "images required" }, { status: 400 });
  }

  // url is optional (legacy). s3Key is the source of truth.
  if (!images.every((img: any) => img?.s3Key)) {
    return NextResponse.json({ error: "Invalid images data" }, { status: 400 });
  }

  // Each image = { s3Key, url? }
  const pod = await Pod.create({
    
    uploadedBy: user.id,
    branch: user.branchId,
    images: images.map((img: any) => ({
      s3Key: img.s3Key,
      url: img.url,
      status: "PENDING",
      uploadedAt: new Date(),
    })),
    notes,
    status: "PENDING",
  });

  return NextResponse.json(pod, { status: 201 });
}
