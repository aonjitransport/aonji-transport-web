// models/ContactMessage.ts
import mongoose from "mongoose";

const ContactMessageSchema = new mongoose.Schema({
  messageId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  message: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ["NEW", "IN_PROGRESS", "COMPLETED", "ARCHIVED"],
    default: "NEW",
  },
  isRead: { type: Boolean, default: false },
  source: { type: String, default: "contact" },
  createdAt: { type: Date, default: Date.now },
});

ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ messageId: 1 }, { unique: true });
ContactMessageSchema.index({ status: 1, createdAt: -1 });
ContactMessageSchema.index({ phoneNumber: 1, createdAt: -1 });
ContactMessageSchema.index({ email: 1, createdAt: -1 });

export const ContactMessage =
  mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", ContactMessageSchema);
