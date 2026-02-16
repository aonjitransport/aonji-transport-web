import mongoose from "mongoose";
import { Counter } from "./Counter";

const ConsigneeSchema = new mongoose.Schema({
  name: String,
  phone: Number,
  numOfParcels: Number,
  type: String,
  amount: Number,
  address: String,
});

const BillSchema = new mongoose.Schema(
  {
    lrNumber: { type: String, unique: true }, // formatted ID (e.g. B10250001)
    date: String,
    to: String,
    agency: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
      phone: Number,
      address: String,
    },
    totalNumOfParcels: Number,
    totalAmount: Number,
    paymentStatus: Boolean,
    addedToTripFlag: Boolean,
    deliveryStatus: Boolean,
    doorDelivery: { type: Boolean, default: false },
    confirmDelivery: Boolean,

    consigner: {
      name: String,
      phone: Number,
      address: String,
    },
    consignees: [ConsigneeSchema],
    administrator: { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ Pre-save hook for formatted bill number
BillSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  console.log("🧩 [DEBUG] Running pre-save hook for Bill...");

  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const counterId = `lr-${yy}${mm}`; // e.g. lr-2510

  const counter = await Counter.findOneAndUpdate(
    { id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  console.log("✅ [DEBUG] Counter result:", counter);

  const seq = String(counter.seq).padStart(4, "0"); // e.g. 0001
  this.lrNumber = `LR${mm}${yy}${seq}`;

  console.log("✅ [DEBUG] Generated lrNumber:", this.lrNumber);

  next();
});

// ✅ Use model caching correctly (prevents hook loss)
export const Bill =
  mongoose.models.Bill || mongoose.model("Bill", BillSchema);
