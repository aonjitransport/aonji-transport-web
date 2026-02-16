import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
 
  loginId: string;
  name: string;
  password: string;
  role: "super_admin" | "admin" | "agent";
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  lastLoginAt?: Date;
}

const UserSchema = new Schema<IUser>(
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
      select: false, // 🔒 CRITICAL
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

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
