// src/app/api/pod/verify/route.ts

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "lib/mongodb";
import { Pod } from "models/Pod";
import { Bill } from "models/Bill";
import { Trip } from "models/Trip";
import { requireRole } from "lib/auth";

// Image-based verification: a "queue item" is one PENDING image inside a pod.
export type PodQueueItem = {
  podId: string;
  imageId: string;
  imageIndex: number;
  s3Key: string;
  uploadedAt: string;
  notes: string;
  createdAt: string;
  uploadedBy: any;
  branch: any;
};

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await requireRole(req, ["admin", "super_admin"]);
    if (auth instanceof NextResponse) return auth;

    const pods = await Pod.find({
      $or: [{ status: "PENDING" }, { "images.status": "PENDING" }],
    })
      .populate("uploadedBy", "name")
      .populate("branch", "name city")
      .sort({ createdAt: 1 })
      .lean();

    const queue: PodQueueItem[] = [];

    for (const p of pods ?? []) {
      const images = Array.isArray((p as any).images) ? (p as any).images : [];

      images.forEach((img: any, imageIndex: number) => {
        const imageStatus = img?.status ?? "PENDING"; // legacy docs => treat as pending
        if (imageStatus !== "PENDING") return;
        if (!img?.s3Key || !img?._id) return;

        queue.push({
          podId: String((p as any)._id),
          imageId: String(img._id),
          imageIndex,
          s3Key: img.s3Key,
          uploadedAt: String(img.uploadedAt ?? (p as any).createdAt),
          notes: String((p as any).notes ?? ""),
          createdAt: String((p as any).createdAt),
          uploadedBy: (p as any).uploadedBy,
          branch: (p as any).branch,
        });
      });
    }

    queue.sort(
      (a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime(),
    );

    return NextResponse.json(queue);
  } catch (error: any) {
    console.error("POD queue fetch error:", error);
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

    const { podId, imageId, action, lrNumber, rejectionReason } = await req.json();

    if (!podId || !imageId || !action) {
      return NextResponse.json(
        { error: "podId, imageId and action required" },
        { status: 400 },
      );
    }

    session.startTransaction();

    const pod: any = await Pod.findById(podId).session(session);
    if (!pod) throw new Error("POD not found");

    const img: any = (pod.images as any[]).find(
      (i: any) => i?._id?.toString() === String(imageId),
    );
    if (!img) throw new Error("POD image not found");

    const currentStatus = img.status ?? "PENDING";
    if (currentStatus !== "PENDING") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: "Image already processed" }, { status: 400 });
    }

    if (action === "REJECT") {
      img.status = "REJECTED";
      img.rejectionReason = rejectionReason || "Rejected";
      img.verifiedAt = new Date();
      img.verifiedBy = auth.user.id;
      img.lrNumber = undefined;
      img.billId = undefined;

      rollupPodStatus(pod);
      await pod.save({ session });

      await session.commitTransaction();
      session.endSession();
      return NextResponse.json({ success: true, message: "Image rejected" });
    }

    if (action === "VERIFY") {
      if (!lrNumber) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { error: "lrNumber required for verification" },
          { status: 400 },
        );
      }

      img.status = "VERIFIED";
      img.verifiedAt = new Date();
      img.verifiedBy = auth.user.id;
      img.lrNumber = String(lrNumber);

      // Update each linked bill using this image's s3Key.
      const bill = await Bill.findOne({ lrNumber: String(lrNumber) }).session(session);
      if (!bill) throw new Error(`Bill not found for LR: ${lrNumber}`);

      img.billId = bill._id;

      bill.status = "POD_RECEIVED";
      bill.podVerified = true;
      bill.podVerifiedAt = new Date();
      bill.podDocument = img?.s3Key || null;
      bill.statusHistory.push({
        status: "POD_RECEIVED",
        date: new Date(),
        updatedBy: auth.user.id,
      });
      await bill.save({ session });

      const trip = await Trip.findOne({ bills: bill._id }).session(session);
      if (trip) {
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

      rollupPodStatus(pod);
      await pod.save({ session });

      await session.commitTransaction();
      session.endSession();
      return NextResponse.json({ success: true, message: "Image verified" });
    }

    await session.abortTransaction();
    session.endSession();
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error("POD image verification failed:", error);
    return NextResponse.json({ error: "Failed to verify image" }, { status: 500 });
  }
}

function rollupPodStatus(pod: any) {
  const statuses = (pod.images as any[]).map((i: any) => i?.status ?? "PENDING");
  if (statuses.some((s: string) => s === "PENDING")) pod.status = "PENDING";
  else if (statuses.some((s: string) => s === "REJECTED")) pod.status = "REJECTED";
  else pod.status = "VERIFIED";
}
