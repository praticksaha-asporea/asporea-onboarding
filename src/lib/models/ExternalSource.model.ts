import mongoose, { Schema, Document, Types } from "mongoose";

export interface IExternalSource extends Document {
  name: string;

  type: "pca" | "pcra" | "institute";

  userId: Types.ObjectId;
  subOf?: Types.ObjectId;


  status?: "active" | "inactive";

  createdAt: Date;
  updatedAt: Date;
}

const ExternalSourceSchema = new Schema<IExternalSource>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["pca", "pcra", "institute"],
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subOf: {
      type: Schema.Types.ObjectId,
      ref: "ExternalSource",
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */


// ExternalSourceSchema.index(
//   { name: 1, type: 1 },
//   { unique: true }
// );

/* ================= EXPORT ================= */

export const ExternalSourceModel =
  mongoose.models.ExternalSource ||
  mongoose.model<IExternalSource>(
    "ExternalSource",
    ExternalSourceSchema
  );