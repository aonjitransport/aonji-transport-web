// models/Pod.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPod extends Document {
  
  uploadedBy: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  images: {
    s3Key: string;
    // Stored public URL is optional and should not be trusted for rendering in production.
    // Prefer using the server to generate signed GET URLs from s3Key.
    url?: string;
    uploadedAt: Date;
    status: "PENDING" | "VERIFIED" | "REJECTED";
    rejectionReason?: string;
    verifiedBy?: mongoose.Types.ObjectId;
    verifiedAt?: Date;
    // One image corresponds to one LR in your workflow.
    lrNumber?: string;
    billId?: mongoose.Types.ObjectId;
  }[];
  // Roll-up status for the whole pod (derived from images[].status).
  status: "PENDING" | "VERIFIED" | "REJECTED";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PodSchema = new Schema<IPod>(
  {
    
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    images: [
      {
        s3Key: { type: String, required: true },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["PENDING", "VERIFIED", "REJECTED"],
          default: "PENDING",
        },
        rejectionReason: { type: String },
        verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
        verifiedAt: { type: Date },
        lrNumber: { type: String },
        billId: { type: Schema.Types.ObjectId, ref: "Bill" },
      },
    ],
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// ✅ Index for faster queue queries
PodSchema.index({ status: 1, createdAt: 1 });
PodSchema.index({ "images.status": 1, "images.uploadedAt": 1 });

export const Pod =
  mongoose.models.Pod || mongoose.model<IPod>("Pod", PodSchema);
