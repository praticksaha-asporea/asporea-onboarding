import mongoose, { Schema, Document } from "mongoose";

export interface IBranch extends Document {
  title?: string;
  location?: string;
  counters?: number;
  timeZone?: string;

  workDays?: string[];
  coordinates?: {
    type: "Point";
    coordinates: [number, number];
  };

  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    title: { type: String, trim: true },

    location: { type: String, trim: true },

    counters: { type: Number, default: 0 },

    timeZone: { type: String, default: "Asia/Kolkata" },

    workDays: [
      {
        type: String,
        enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
    ],
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  { timestamps: true }
);

/* INDEXES */
BranchSchema.index({ title: 1 });
BranchSchema.index({ coordinates: "2dsphere" });

/* EXPORT */
export const BranchModel =
  mongoose.models.Branch ||
  mongoose.model<IBranch>("Branch", BranchSchema);