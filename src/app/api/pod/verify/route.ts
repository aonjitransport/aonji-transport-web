// src/app/api/trips/[id]/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "lib/mongodb";
import { Pod } from "models/Pod";
import { Bill } from "models/Bill";
import { Trip } from "models/Trip";
import { requireRole } from "lib/auth";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, S3_BUCKET } from "lib/s3";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await requireRole(req, ["admin", "super_admin"]);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";

    const pods = await Pod.find({ status })
      .populate("uploadedBy", "name")
      .populate("branch", "name city")
      .sort({ createdAt: 1 }) // oldest first — FIFO queue
      .lean();

    // Always include a signed URL for the first image so the frontend never depends
    // on any stored public S3 URL (which may be wrong/undefined in production).
    const out = await Promise.all(
      (pods ?? []).map(async (p: any) => {
        const img0 = p?.images?.[0];
        const key = img0?.s3Key;
        if (!key) return p;
        try {
          const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
          const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
          return {
            ...p,
            images: [
              { ...img0, url },
              ...(Array.isArray(p.images) ? p.images.slice(1) : []),
            ],
          };
        } catch {
          return p;
        }
      }),
    );

    return NextResponse.json(out); // returns array directly — matches frontend
  } catch (error: any) {
    console.error("POD fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  await connectToDatabase();
  const session = await mongoose.startSession();

  try {
    const auth = await requireRole(req, ["admin", "super_admin"]);
    if (auth instanceof NextResponse) return auth;

    // ✅ Read what frontend actually sends
    const { podId, action, linkedLRs, rejectionReason } = await req.json();

    if (!podId || !action) {
      return NextResponse.json({ error: "podId and action required" }, { status: 400 });
    }

    session.startTransaction();

    const pod = await Pod.findById(podId).session(session);
    if (!pod) throw new Error("POD not found");

    if (pod.status !== "PENDING") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: "POD already processed" }, { status: 400 });
    }

    /* ── REJECT ── */
    if (action === "REJECT") {
      pod.status = "REJECTED";
      pod.rejectionReason = rejectionReason || "Rejected";
      pod.verifiedAt = new Date();
      pod.verifiedBy = auth.user.id;
      await pod.save({ session });
      await session.commitTransaction();
      session.endSession();
      return NextResponse.json({ success: true, message: "POD rejected" });
    }

    /* ── VERIFY ── */
    if (action === "VERIFY") {
      if (!linkedLRs || linkedLRs.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ error: "linkedLRs required for verification" }, { status: 400 });
      }

      // ✅ Save linkedLRs to pod first, then process
      pod.status = "VERIFIED";
      pod.verifiedAt = new Date();
      pod.verifiedBy = auth.user.id;
      pod.linkedLRs = linkedLRs;   // ← this was missing — LRs never saved
      await pod.save({ session });

      /* ── UPDATE EACH LINKED BILL ── */
      for (const lr of linkedLRs) {
        const bill = await Bill.findOne({ lrNumber: lr.lrNumber }).session(session);

        if (!bill) {
          console.warn(`Bill not found for LR: ${lr.lrNumber}`);
          continue;
        }

        bill.status = "POD_RECEIVED";
        bill.podVerified = true;
        bill.podVerifiedAt = new Date();
        bill.podDocument = pod.images?.[lr.imageIndex ?? 0]?.s3Key || null;
        bill.statusHistory.push({
          status: "POD_RECEIVED",
          date: new Date(),
          updatedBy: auth.user.id,
        });

        await bill.save({ session });

        /* ── AUTO COMPLETE TRIP ── */
        const trip = await Trip.findOne({ bills: bill._id }).session(session);
        if (!trip) continue;

        const unverifiedCount = await Bill.countDocuments({
          _id: { $in: trip.bills },
          podVerified: false,
        }).session(session);

        if (unverifiedCount === 0 && trip.status !== "COMPLETED") {
          trip.status = "COMPLETED";
          trip.statusHistory.push({
            status: "COMPLETED",
            date: new Date(),
            updatedBy: auth.user.id,
          });
          await trip.save({ session });
        }
      }

      await session.commitTransaction();
      session.endSession();
      return NextResponse.json({ success: true, message: "POD verified and bill updated" });
    }

    await session.abortTransaction();
    session.endSession();
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("POD verification failed:", error);
    return NextResponse.json({ error: "Failed to verify POD" }, { status: 500 });
  }
}
