import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPosition extends Document {
  title: string;
  details?: string;

  requiredDocuments?: Types.ObjectId[];
  mandatoryDocuments?: Types.ObjectId[];

  positionBrochure?: Types.ObjectId;
  status?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const PositionSchema = new Schema<IPosition>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    details: String,

    requiredDocuments: [
      {
        type: Schema.Types.ObjectId,
        ref: "DocumentType",
      },
    ],

    mandatoryDocuments: [
      {
        type: Schema.Types.ObjectId,
        ref: "DocumentType",
      },
    ],

    positionBrochure: {
      type: Schema.Types.ObjectId,
      ref: "Upload",
    },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Position =
  mongoose.models.Position ||
  mongoose.model<IPosition>("Position", PositionSchema);