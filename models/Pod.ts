// models/Pod.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPod extends Document {
  
  uploadedBy: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  images: {
    s3Key: string;
    url: string;
    uploadedAt: Date;
  }[];
  status: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  linkedLRs: {
    lrNumber: string;
    billId: mongoose.Types.ObjectId;
    imageIndex: number; // which image in the array belongs to this LR
  }[];
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
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
    rejectionReason: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    linkedLRs: [
      {
        lrNumber: { type: String },
        billId: { type: Schema.Types.ObjectId, ref: "Bill" },
        imageIndex: { type: Number },
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);

// ✅ Index for faster queue queries
PodSchema.index({ status: 1, createdAt: 1 });

export const Pod =
  mongoose.models.Pod || mongoose.model<IPod>("Pod", PodSchema);