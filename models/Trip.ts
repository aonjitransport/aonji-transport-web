import mongoose, { Schema } from "mongoose";
import { Boogaloo } from "next/font/google";

const TripSchema = new Schema({
  tripId: { type: String, required: true, unique: true },

  driver: String,

  bills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bill" }],

  originBranch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  destinationBranch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },

  totalArticels: Number,

  agencyCharges: {
    chargeAmount: Number,
    chargeRate: Number,
  },

  totalAmount: Number,
  totalUnpaidAmount: Number,
  netPayableAmount: Number,
  grandTotalChargeAmount: Number,

  vehicleNumber: String,

  paymentStatus: { type: Boolean, default: false },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // ✅ FIXED STATUS FLOW
 status: {
  type: String,
  enum: ["PLANNED", "IN_TRANSIT", "REACHED", "COMPLETED"],
  default: "PLANNED"
},

statusHistory: [
  {
    status: String, 
    date: { type: Date, default: Date.now },
    updatedBy: String 
  }
],  


}, { timestamps: true });

// ✅ indexes
TripSchema.index({ originBranch: 1 });
TripSchema.index({ destinationBranch: 1 });

// 🚀 Performance indexes (combined queries)
TripSchema.index({ originBranch: 1, createdAt: -1 });
TripSchema.index({ destinationBranch: 1, createdAt: -1 });

// ❌ removed duplicate createdAt index

export const Trip =
  mongoose.models.Trip || mongoose.model("Trip", TripSchema);
