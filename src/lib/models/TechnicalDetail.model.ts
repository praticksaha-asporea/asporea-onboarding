import {
  Schema, Document, Types,
  model,
  models,
} from "mongoose";

export interface ITechnicalDetail extends Document {
  leadId: Types.ObjectId;
  assignmentId: Types.ObjectId;

  totalScore?: number;
  achievedScore?: number;

  breakdownPdf?: Types.ObjectId;

  timeTaken?: string;

  questions?: number;
  answered?: number;

  feedback?: string;
  status?: 'passed' | 'failed';

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

    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
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
    status: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */

// TechnicalDetailSchema.index({ leadId: 1 });

/* ================= EXPORT ================= */

export const TechnicalDetailModel =
  models.TechnicalDetail ||
  model<ITechnicalDetail>("TechnicalDetail", TechnicalDetailSchema);