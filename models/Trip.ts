import mongoose, { Schema } from "mongoose";

const TripSchema = new Schema({
  tripId: { type: String, required: true, unique: true },
  driver: String,
  agencyName: { type: String, required: true },
  agency: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
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
  paymentStatus: { type: String, default: false },
}, { timestamps: true });

export const Trip =
  mongoose.models.Trip || mongoose.model("Trip", TripSchema);
