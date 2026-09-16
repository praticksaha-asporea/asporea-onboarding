import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEscalation extends Document {
  fromId: Types.ObjectId;
  leadId: Types.ObjectId;

  status: "requested" | "actionTaken";

  reason?: string;
  remarks?: string;

  actionedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const EscalationSchema = new Schema<IEscalation>(
  {
    fromId: {
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
      enum: ["requested", "actionTaken"],
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

EscalationSchema.index({ leadId: 1 });

export const EscalationModel =
  mongoose.models.Escalation ||
  mongoose.model<IEscalation>(
    "Escalation",
    EscalationSchema
  );