// src/app/api/pod/presign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, S3_BUCKET } from "../../../../../lib/s3";
import { requireRole } from "../../../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["admin", "super_admin", "agent"]);
    if (auth instanceof NextResponse) return auth;

    const { fileType } = await req.json();

    if (!fileType) {
      return NextResponse.json(
        { error: "fileType is required" },
        { status: 400 }
      );
    }

    if (!fileType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    const ext = fileType.split("/")[1] || "jpg";
    const s3Key = `pods/${Date.now()}-${Math.random()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

    // ✅ URL built on server side — AWS_REGION and S3_BUCKET always available here
    // This prevents the "undefined" bucket name issue on EC2 after build
    const imageUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return NextResponse.json({
      presignedUrl,
      s3Key,
      url: imageUrl, // ✅ frontend uses this directly — no NEXT_PUBLIC env needed
    });

  } catch (error: any) {
    console.error("Presign error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}