import mongoose, { Schema, Document } from "mongoose";

export interface IGeneralSetting extends Document {
  lastInq?: number;
  lastFy?: string;
  lastAssessment?: string;

  escalationTimelineHours?: number;
  inqResTimelineHours?: number;
  preCounsellingTimelineHours?: number;
  assessmentTimelineHours?: number;

  createdAt: Date;
  updatedAt: Date;
}

const GeneralSettingSchema = new Schema<IGeneralSetting>(
  {
    lastInq: {
      type: Number,
      default: 0,
    },

    lastFy: {
      type: String,
      trim: true,
    },

    lastAssessment: {
      type: String,
      trim: true,
    },

    escalationTimelineHours: {
      type: Number,
      default: 24,
    },

    inqResTimelineHours: {
      type: Number,
      default: 24,
    },

    preCounsellingTimelineHours: {
      type: Number,
      default: 24,
    },

    assessmentTimelineHours: {
      type: Number,
      default: 24,
    },
  },
  { timestamps: true }
);

/* ================= SINGLETON ENFORCEMENT ================= */

// only one document allowed
GeneralSettingSchema.index({}, { unique: true });

/* ================= EXPORT ================= */

export const GeneralSettingModel =
  mongoose.models.GeneralSetting ||
  mongoose.model<IGeneralSetting>(
    "GeneralSetting",
    GeneralSettingSchema
  );