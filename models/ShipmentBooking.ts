// models/ShipmentBooking.ts
import mongoose from "mongoose";

const ShipmentBookingSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true, trim: true },
  shipToLocation: { type: String, required: true, trim: true },
  customerName: { type: String, required: true, trim: true },
  mobileNumber: { type: String, required: true, trim: true },
  goodsQuantity: { type: Number, required: true, min: 1 },
  goodsType: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ["NEW", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
    default: "NEW",
  },
  isRead: { type: Boolean, default: false },
  source: { type: String, default: "landing" },
  createdAt: { type: Date, default: Date.now },
});

ShipmentBookingSchema.index({ createdAt: -1 });
ShipmentBookingSchema.index({ requestId: 1 }, { unique: true });
ShipmentBookingSchema.index({ status: 1, createdAt: -1 });
ShipmentBookingSchema.index({ mobileNumber: 1, createdAt: -1 });

export const ShipmentBooking =
  mongoose.models.ShipmentBooking ||
  mongoose.model("ShipmentBooking", ShipmentBookingSchema);
