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
   
    fromBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },

  toBranch: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },

  createdBy: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

 



  },
  { timestamps: true }
);

// ✅ Pre-save hook for formatted LR number (SAFE + ATOMIC)
BillSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  console.log("🧩 [DEBUG] Running pre-save hook for Bill...");

  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const yy = String(yyyy).slice(-2); // last 2 digits

  // 🔑 Unified counter key (monthly LR reset)
  const counterKey = `lr-${yyyy}-${mm}`; // e.g. lr-2026-01

  const counter = await Counter.findOneAndUpdate(
    { key: counterKey },
    {
      $inc: { seq: 1 },
      $setOnInsert: { key: counterKey },
    },
    {
      new: true,
      upsert: true,
    }
  );

  console.log("✅ [DEBUG] Counter result:", counter);

  const seq = String(counter.seq).padStart(4, "0");

  // 📄 Final LR number format
  this.lrNumber = `LR${mm}${yy}${seq}`;

  console.log("✅ [DEBUG] Generated lrNumber:", this.lrNumber);

  next();
});


// ✅ Use model caching correctly (prevents hook loss)
export const Bill =
  mongoose.models.Bill || mongoose.model("Bill", BillSchema);
