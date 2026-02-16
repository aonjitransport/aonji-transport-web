import mongoose, { Schema } from "mongoose";

const AgencySchema = new Schema(
  {
    // 🔐 link to agent user login
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
    },

    district: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    serviceAreas: {
      type: [String],
      default: [],
    },

    address: {
      type: String,
    },

    pincode: {
      type: String,
    },

    trips: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
      },
    ],
  },
  { timestamps: true }
);

export const Agency =
  mongoose.models.Agency || mongoose.model("Agency", AgencySchema);
