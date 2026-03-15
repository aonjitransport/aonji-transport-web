import mongoose from "mongoose";

const TripIdCounterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    strictQuery: false, // 🔥 FIX FOREVER
  }
);

export const Counter =
  mongoose.models.Counter ||
  mongoose.model("Counter", TripIdCounterSchema);
