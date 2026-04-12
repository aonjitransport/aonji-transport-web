// models/Message.ts
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  branch: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Branch", 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    default: null // null for system-generated messages
  },
  senderName: { type: String, required: true },
  senderRole: { 
    type: String, 
    enum: ["admin", "agent", "superadmin", "system"], 
    required: true 
  },
  type: {
    type: String,
    enum: ["PAYMENT_REMINDER", "PAYMENT_RECEIVED", "LOAD_STATEMENT_GENERATED", "ANNOUNCEMENT", "GENERAL"],
    default: "GENERAL"
  },
  title: { type: String, default: null }, // optional title for system messages
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Index for fast queries per branch
MessageSchema.index({ branch: 1, createdAt: -1 });

export const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);