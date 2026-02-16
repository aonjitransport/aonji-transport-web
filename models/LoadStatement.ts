// models/LoadStatement.ts
import mongoose from "mongoose";

const LoadStatementSchema = new mongoose.Schema({
  loadStatementId: { type: String, required: true, unique: true },
  agency: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
  trips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }],
  totalFreightAmount: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  paymentStatus: { type: Boolean, default: false },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const LoadStatement =
  mongoose.models.LoadStatement ||
  mongoose.model("LoadStatement", LoadStatementSchema);
