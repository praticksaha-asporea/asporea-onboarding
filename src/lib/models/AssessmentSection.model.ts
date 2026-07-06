import mongoose, { Schema, Document } from "mongoose";

export interface IAssessmentSection extends Document {
  section: string;
  shortName: string;
  underSection: string;
  maxScore?: number;
}

const AssessmentSectionSchema: Schema = new Schema(
  {
    section: {
      type: String,
      required: true,
      trim: true,
    },
    shortName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    underSection: {
      type: String,
      default: "",
    },
    maxScore: {
      type: Number,

      required: function (this: any) {
        return this.underSection.trim() === "";
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model<IAssessmentSection>(
  "AssessmentSection",
  AssessmentSectionSchema,
);
