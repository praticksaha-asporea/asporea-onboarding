import mongoose, { Schema, Document, Types } from "mongoose";

export interface IShiftSchedule extends Document {
  shiftId: Types.ObjectId;

  days?: string[];

  startTime?: string;
  endTime?: string;
  breakTime?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ShiftScheduleSchema = new Schema<IShiftSchedule>(
  {
    shiftId: {
      type: Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
      index: true,
    },

    days: [
      {
        type: String,
        enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
    ],

    startTime: String, // "09:00 AM"
    endTime: String,
    breakTime: String,
  },
  { timestamps: true }
);

/* INDEXES */
ShiftScheduleSchema.index({ shiftId: 1 });

/* EXPORT */
export const ShiftScheduleModel =
  mongoose.models.ShiftSchedule ||
  mongoose.model<IShiftSchedule>(
    "ShiftSchedule",
    ShiftScheduleSchema
  );