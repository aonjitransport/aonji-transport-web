import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBranch extends Document {
  name: string;                // Branch / Agent name
  city: string;                // Main city
  serviceAreas: string[];      // Cities it serves (TO selection)
  phone?: string;
  address?: string;

  type: "OWN" | "AGENT";       // OWN = your office, AGENT = external agent
  adminIds: mongoose.Types.ObjectId[]; // Transport owners (admins)
  userId?: mongoose.Types.ObjectId; // Linked agent user (optional)
  trips: mongoose.Types.ObjectId[]; // Trips associated with this branch
  isActive: boolean;
  code: string;                // Unique branch code
  totalTrips: number;         // Total trips count
  totalTripAmount: number;    // Total amount from all trips
  totalAgencyEarnings: number; // Total agency earnings
  totalCompanyEarnings: number; // Total company earnings
  totalUnpaidAmount: number; // Total unpaid amount from trips
}

const BranchSchema = new Schema<IBranch>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    serviceAreas: {
      type: [String],
      default: [],
    },

    phone: String,
    address: String,

    type: {
      type: String,
      enum: ["OWN", "AGENT"],
      required: true,
    },

    adminIds: [
     {
      type: Schema.Types.ObjectId,
      ref: "User",
     
     
    }
    
    ],

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    trips: [
  {
    type: Schema.Types.ObjectId,
    ref: "Trip",
    index: true
  }
],
        code: { type: String, required: true, unique: true, index: true },
        
  totalTrips: {
    type: Number,
    default: 0,
  },

  totalTripAmount: {
    type: Number,
    default: 0,
  },

  totalAgencyEarnings: {
    type: Number,
    default: 0,
  },

  totalCompanyEarnings: {
    type: Number,
    default: 0,
  },
  totalUnpaidAmount: {
  type: Number,
  default: 0,
},


  },
  { timestamps: true }
);

export const Branch: Model<IBranch> =
  mongoose.models.Branch || mongoose.model<IBranch>("Branch", BranchSchema);
