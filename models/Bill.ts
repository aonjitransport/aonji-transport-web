// models/Bill.ts
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
const statusEnum = [
  "CREATED",
  "IN_WAREHOUSE",
  "ADDED_TO_TRIP",
  "IN_TRANSIT",
  "ARRIVED_AT_BRANCH",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "POD_RECEIVED",
  "MISSING" // ✅ added
];

const BillSchema = new mongoose.Schema(
  {
    lrNumber: { type: String, unique: true , sparse: true }, // ✅ sparse for safe unique

    date: String,
    to: String,

    totalNumOfParcels: Number,
    totalAmount: Number,

    paymentStatus: Boolean,

    // ⚠️ keep but ignore in logic
    addedToTripFlag: Boolean,
    deliveryStatus: Boolean,

    doorDelivery: { type: Boolean, default: false },
    confirmDelivery: Boolean,

    status: {
      type: String,
      enum: statusEnum,
      default: "CREATED"
    },

    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      default: null
    },

    currentLocation: {
      type: String,
      default: "Origin Branch" // ✅ important
    },

    podDocument: { type: String, default: null },      // S3 key
    podVerified: { type: Boolean, default: false },
    podVerifiedAt: { type: Date },

    statusHistory: [
      {
        status: String,
        date: { type: Date, default: Date.now },
        updatedBy: String
      }
    ],

    deliveredAt: Date,
    receiverName: String,
    podUrl: String,

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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);


BillSchema.pre("save", async function (next) {
  if (!this.isNew || this.lrNumber) return next(); // ✅ added check

  try {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const yy = String(yyyy).slice(-2);

    const counterKey = `lr-${yyyy}-${mm}`;

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

    const seq = String(counter.seq).padStart(4, "0");

    this.lrNumber = `LR${mm}${yy}${seq}`;

    next();
  } catch (err) {
     console.error("Error generating LR number:", err);
     
  }
});


// ✅ Use model caching correctly (prevents hook loss)
export const Bill =
  mongoose.models.Bill || mongoose.model("Bill", BillSchema);
