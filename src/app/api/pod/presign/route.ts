// src/app/api/pod/presign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, S3_BUCKET } from "../../../../../lib/s3";
import { requireRole } from "../../../../../lib/auth";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["admin", "super_admin", "agent"]);
  if (auth instanceof NextResponse) return auth;

  const { fileType,  } = await req.json();

  if (!fileType ) {
    return NextResponse.json({ error: "fileType required" }, { status: 400 });
  }

  const ext = fileType.split("/")[1] || "jpg";
  const s3Key = `pods/${Date.now()}-${Math.random()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    ContentType: fileType,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 mins

  return NextResponse.json({ presignedUrl, s3Key });
}