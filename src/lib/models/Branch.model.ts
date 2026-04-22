import mongoose, { Schema, Document } from "mongoose";

export interface IBranch extends Document {
  title?: string;
  location?: string;
  counters?: number;
  timeZone?: string;

  workDays?: string[];

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
  },
  { timestamps: true }
);

/* INDEXES */
BranchSchema.index({ title: 1 });

/* EXPORT */
export const BranchModel =
  mongoose.models.Branch ||
  mongoose.model<IBranch>("Branch", BranchSchema);