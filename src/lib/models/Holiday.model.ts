import mongoose, { Schema, Document, Types } from "mongoose";

export interface IHoliday extends Document {
  branchId: Types.ObjectId;

  title?: string;

  dateFrom: Date;
  dateTill: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HolidaySchema = new Schema<IHoliday>(
  {
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
    },

    dateFrom: {
      type: Date,
      required: true,
      index: true,
    },

    dateTill: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */

// prevent duplicate same holiday range for a branch
HolidaySchema.index(
  { branchId: 1, dateFrom: 1, dateTill: 1 },
  { unique: true }
);

// fast lookup for date range queries
HolidaySchema.index({ branchId: 1, dateFrom: 1, dateTill: 1 });

/* ================= EXPORT ================= */

export const HolidayModel =
  mongoose.models.Holiday ||
  mongoose.model<IHoliday>("Holiday", HolidaySchema);