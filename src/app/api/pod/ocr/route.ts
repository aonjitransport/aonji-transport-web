// src/app/api/pod/ocr/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  TextractClient,
  DetectDocumentTextCommand,
} from "@aws-sdk/client-textract";

const textract = new TextractClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { s3Key } = body;

    if (!s3Key) {
      return NextResponse.json({ error: "s3Key required" }, { status: 400 });
    }

    const command = new DetectDocumentTextCommand({
      Document: {
        S3Object: {
          Bucket: process.env.AWS_S3_BUCKET!,
          Name: s3Key,
        },
      },
    });

    const response = await textract.send(command);

    const words =
      response.Blocks?.filter((b) => b.BlockType === "WORD").map((b) => ({
        text: b.Text,
        bbox: b.Geometry?.BoundingBox,
      })) || [];

    return NextResponse.json(words);
  } catch (err: any) {
    console.error("TEXTRACT ERROR:", err);
    return NextResponse.json(
      { error: err.message || "OCR failed" },
      { status: 500 }
    );
  }
}