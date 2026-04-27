import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "lib/mongodb";
import { Bill } from "models/Bill";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, S3_BUCKET } from "lib/s3";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const lrNumber = searchParams.get("lr");

    if (!lrNumber) {
      return NextResponse.json(
        { error: "LR number is required" },
        { status: 400 }
      );
    }

    const bill = await Bill.findOne({ lrNumber })
      .populate("fromBranch", "name")
      .populate("toBranch", "name");

    if (!bill) {
      return NextResponse.json(
        { error: "Shipment not found" },
        { status: 404 }
      );
    }

    /* ---------------- POD URL ---------------- */
    let podUrl: string | null = null;

    if (bill.podVerified && bill.podDocument) {
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: bill.podDocument,
      });

      podUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });
    }

    /* ---------------- RESPONSE ---------------- */

    return NextResponse.json({
      lrNumber: bill.lrNumber,
      status: bill.status,
      currentLocation: bill.currentLocation,

      from: bill.fromBranch?.name,
      to: bill.toBranch?.name,

      consigner: {
        name: bill.consigner?.name,
      },

      consignee: bill.consignees?.[0]?.name,

      totalParcels: bill.totalNumOfParcels,

      timeline: bill.statusHistory.map((s: any) => ({
        status: s.status,
        date: s.date,
      })),

      pod: bill.podVerified
        ? {
            available: true,
            url: podUrl,
            verifiedAt: bill.podVerifiedAt,
          }
        : {
            available: false,
          },
    });
  } catch (err) {
    console.error("Public tracking error:", err);

    return NextResponse.json(
      { error: "Failed to fetch tracking details" },
      { status: 500 }
    );
  }
}