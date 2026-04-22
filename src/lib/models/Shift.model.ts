import mongoose, { Schema, Document } from "mongoose";

export interface IShift extends Document {
  shiftName?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ShiftSchema = new Schema<IShift>(
  {
    shiftName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

/* INDEX */
ShiftSchema.index({ shiftName: 1 });

/* EXPORT */
export const ShiftModel =
  mongoose.models.Shift ||
  mongoose.model<IShift>("Shift", ShiftSchema);