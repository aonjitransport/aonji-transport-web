// models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  loginId: string;
  name: string;
  password: string;
  role: "super_admin" | "admin" | "agent";
  isActive: boolean;

  branchId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  lastLoginAt?: Date;
}

/**
 * 👇 THIS is the missing piece you asked for
 * This is what you use as a TYPE
 */
export type UserDocument = IUser & Document;

const UserSchema = new Schema<UserDocument>(
  {
    loginId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["super_admin", "admin", "agent"],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);
