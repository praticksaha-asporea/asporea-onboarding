import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEscalationReport extends Document {
  fromId: Types.ObjectId;
  toId: Types.ObjectId;

  leadId: Types.ObjectId;

  status: "requested" | "approved" | "rejected";

  reason?: string;
  remarks?: string;

  actionedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const EscalationReportSchema = new Schema<IEscalationReport>(
  {
    fromId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    toId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["requested", "approved", "rejected"],
      default: "requested",
      index: true,
    },

    reason: {
      type: String,
      trim: true,
    },

    remarks: {
      type: String,
      trim: true,
    },

    actionedAt: Date,
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
EscalationReportSchema.index({ assignmentId: 1 });
// EscalationReportSchema.index({ fromId: 1 });
// EscalationReportSchema.index({ toId: 1 });

/* ================= EXPORT ================= */
export const EscalationReportModel =
  mongoose.models.EscalationReport ||
  mongoose.model<IEscalationReport>(
    "EscalationReport",
    EscalationReportSchema
  );