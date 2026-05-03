// app/api/public/download-pod/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const filename = searchParams.get("filename") || "POD.jpg";

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const s3Res = await fetch(url);
  if (!s3Res.ok) {
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }

  const blob = await s3Res.arrayBuffer();

  return new NextResponse(blob, {
    headers: {
      "Content-Type": s3Res.headers.get("Content-Type") || "image/jpeg",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}