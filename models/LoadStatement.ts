// models/LoadStatement.ts
import mongoose, { Schema, Document, Model } from "mongoose";

// ✅ Interface
export interface ILoadStatement extends Document {
  loadStatementId: string;
  branch: mongoose.Types.ObjectId;
  trips: mongoose.Types.ObjectId[];
  totalFreightAmount: number;
  agencyCommission: number;
  netPayableToMain: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: "pending" | "partial" | "paid";  // ✅ 3 states
  paymentHistory: {
    amount: number;
    paidOn: Date;
    note: string;
    recordedBy: mongoose.Types.ObjectId;
    recordedByName: string;
  }[];
  closedAt?: Date;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const LoadStatementSchema = new Schema<ILoadStatement>(
  {
    loadStatementId: { type: String, required: true, unique: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    trips: [{ type: Schema.Types.ObjectId, ref: "Trip" }],

    totalFreightAmount: { type: Number, default: 0 },
    agencyCommission: { type: Number, default: 0 },
    netPayableToMain: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },

    paymentStatus: {
  type: String,
  enum: ["pending", "partial", "paid"],
  default: "pending",
},

  paymentHistory: [
      {
        amount: { type: Number, required: true },
        paidOn: { type: Date, default: Date.now },
        note: { type: String, default: "" },
        recordedBy: { type: Schema.Types.ObjectId, ref: "User" },
        recordedByName: { type: String, default: "System" },
        
      },
    ],

    closedAt: { type: Date, default: null },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate statement for same branch+month+year
LoadStatementSchema.index({ branch: 1, month: 1, year: 1 }, { unique: true });

export const LoadStatement: Model<ILoadStatement> =
  mongoose.models.LoadStatement ||
  mongoose.model<ILoadStatement>("LoadStatement", LoadStatementSchema);