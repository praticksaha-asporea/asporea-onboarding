import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITechnicalDetail extends Document {
  leadId: Types.ObjectId;
  assessmentId: Types.ObjectId;

  totalScore?: number;
  achievedScore?: number;

  breakdownPdf?: Types.ObjectId;

  timeTaken?: string;

  questions?: number;
  answered?: number; 

  feedback?: string;

  createdAt: Date;
  updatedAt: Date;
}

const TechnicalDetailSchema = new Schema<ITechnicalDetail>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      unique: true, // 1:1 relation
      index: true,
    },

    totalScore: Number,
    achievedScore: Number,

    breakdownPdf: {
      type: Schema.Types.ObjectId,
      ref: "Upload",
    },

    timeTaken: String,

    questions: Number,
    answered: Number,

    feedback: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */

TechnicalDetailSchema.index({ leadId: 1 });

/* ================= EXPORT ================= */

export const TechnicalDetailModel =
  mongoose.models.TechnicalDetail ||
  mongoose.model<ITechnicalDetail>(
    "TechnicalDetail",
    TechnicalDetailSchema
  );