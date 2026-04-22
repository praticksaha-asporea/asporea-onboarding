import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAssessment extends Document {
  leadId: Types.ObjectId;

  assessmentNo?: string;
  passportNo?: string;
  date?: Date;

  assessedBy?: Types.ObjectId;

  scores?: {
    total?: number;
    achieved?: number;
  };

  notes?: {
    text?: string;
    createdAt?: Date;
  }[];

  technical?: {
    totalScore?: number;
    achievedScore?: number;

    breakdownPdf?: Types.ObjectId;

    timeTaken?: string;
    questions?: number;
    answered?: number;

    feedback?: string;
  };

  signatures?: {
    assessor?: Types.ObjectId;
    candidate?: Types.ObjectId;
  };
  

  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    assessmentNo: {
      type: String,
      unique: true,
      sparse: true,
    },

    passportNo: {
      type: String,
      trim: true,
      index: true,
    },

    date: {
      type: Date,
      index: true,
    },

    assessedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    scores: {
      total: Number,
      achieved: Number,
    },

    notes: [
      {
        text: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    technical: {
      totalScore: Number,
      achievedScore: Number,

      breakdownPdf: {
        type: Schema.Types.ObjectId,
        ref: "Upload",
      },

      timeTaken: String,
      questions: Number,
      answered: Number,

      feedback: String,
    },

    signatures: {
      assessor: {
        type: Schema.Types.ObjectId,
        ref: "Upload",
      },
      candidate: {
        type: Schema.Types.ObjectId,
        ref: "Upload",
      },
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
AssessmentSchema.index({ leadId: 1 });
AssessmentSchema.index({ assessedBy: 1 });
AssessmentSchema.index({ date: 1 });

/* ================= EXPORT ================= */
export const AssessmentModel =
  mongoose.models.Assessment ||
  mongoose.model<IAssessment>("Assessment", AssessmentSchema);