import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  seq: { type: Number, default: 0 },
});

export const Counter =
  mongoose.models.Counter || mongoose.model("Counter", CounterSchema);
