import mongoose, { Schema, Document } from "mongoose";

export interface IAssessmentQuestion extends Document {
  title: string;
  shortName?: string;

  marks?: number;

  section?: string;     // e.g. "Academic"
  subSection?: string;  // e.g. "3 Years Undergraduate"

  type?: "rating" | "boolean" | "text";

  levels?: string[]; // ["L1","L2","L3","L4"]
  isDeleted?: boolean;
  order?: number;

  createdAt: Date;
  updatedAt: Date;
}

const AssessmentQuestionSchema = new Schema<IAssessmentQuestion>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    shortName: {
      type: String,
      trim: true,
    },

    marks: {
      type: Number,
      default: 0,
    },

    section: {
      type: String,
      trim: true,
      index: true,
    },

    subSection: {
      type: String,
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    type: {
      type: String,
      enum: ["rating", "boolean", "text"],
      default: "rating",
    },

    levels: [
      {
        type: String,
      },
    ],

    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */

// for ordering UI
AssessmentQuestionSchema.index({ section: 1, order: 1 });
// AssessmentQuestionSchema.index({ isDeleted: 1 });
/* ================= EXPORT ================= */

export const AssessmentQuestionModel =
  mongoose.models.AssessmentQuestion ||
  mongoose.model<IAssessmentQuestion>(
    "AssessmentQuestion",
    AssessmentQuestionSchema
  );