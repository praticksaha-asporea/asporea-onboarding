import mongoose, { Schema, Document } from "mongoose";

export interface IAssessmentSection extends Document {
  section: string;
  shortName: string;
  underSection: string;
  maxScore?: number;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSectionSchema = new Schema<IAssessmentSection>(
  {
    section: {
      type: String,
      required: true,
      trim: true,
    },
    shortName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    underSection: {
      type: String,
      default: "",
    },
    maxScore: {
      type: Number,
      required: function (this: any) {
        return !this.underSection || this.underSection.trim() === "";
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.models.AssessmentSection ||
  mongoose.model<IAssessmentSection>(
    "AssessmentSection",
    AssessmentSectionSchema,
  );
