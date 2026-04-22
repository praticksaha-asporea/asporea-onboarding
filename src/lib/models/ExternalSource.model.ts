import mongoose, { Schema, Document } from "mongoose";

export interface IExternalSource extends Document {
  name: string;

  type: "pca" | "pcra" | "institute";

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

// prevent duplicate same source name under same type
ExternalSourceSchema.index(
  { name: 1, type: 1 },
  { unique: true }
);

/* ================= EXPORT ================= */

export const ExternalSourceModel =
  mongoose.models.ExternalSource ||
  mongoose.model<IExternalSource>(
    "ExternalSource",
    ExternalSourceSchema
  );