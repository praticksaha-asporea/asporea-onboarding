import mongoose, { Schema, Document } from "mongoose";

export interface IGeneralSetting extends Document {
  lastInq?: number;
  lastFy?: string;
  // lastCounter?: string;

  escalationTimelineHours?: number;
  inqResTimelineHours?: number;
  preCounsellingTimelineHours?: number;
  assessmentTimelineHours?: number;
  tacAssignmentType?: "random" | "counterwise";
  inquiryNumberFormat?: string;
  assessment?: {
    fullMarks?: number;
    passingMarks?: number;
  };
  technical?: {
    fullMarks?: number;
    passingMarks?: number;
  };

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

    // lastCounter:{
    //   type: String,
    //   trim: true,
    // },

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

    /* TAC Assignment */
    tacAssignmentType: {
      type: String,
      enum: ["random", "counterwise"],
      default: "random",
    },

    /* Inquiry Number Format */
    inquiryNumberFormat: {
      type: String,
      default: "ASP-INQ-00000",
      trim: true,
    },
    assessment: {
      fullMarks: { type: Number, default: 100 },
      passingMarks: { type: Number, default: 40 }
    },
    technical: {
      fullMarks: { type: Number, default: 100 },
      passingMarks: { type: Number, default: 40 }
    }
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