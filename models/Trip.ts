import mongoose, { Schema } from "mongoose";
import { Boogaloo } from "next/font/google";

const TripSchema = new Schema({
  tripId: { type: String, required: true, unique: true },
  driver: String,
  
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  bills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bill" }],
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
  destinationBranch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  originBranch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  
  paymentStatus: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   status: {
      type: String,
      enum: ["pending", "in_transit", "delivered"],
      default: "pending",   
   }
   
}, { timestamps: true });

// 🚀 Performance indexes
TripSchema.index({ branch: 1, createdAt: -1 });
TripSchema.index({ createdAt: -1 });


export const Trip =
  mongoose.models.Trip || mongoose.model("Trip", TripSchema);
