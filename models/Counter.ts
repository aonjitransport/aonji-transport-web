import mongoose, { Schema } from "mongoose";

const CounterSchema = new Schema(
  {
    key: { type: String, required: true, unique: true }, // ✅ ONLY key
    seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Counter =
  mongoose.models.Counter ||
  mongoose.model("Counter", CounterSchema);
