import mongoose, { Schema, Document } from "mongoose";

export interface IDocumentType extends Document {
  title: string;

  section: "resume" | "document" | "experience" | "academic" | "additional";

  subTitle?: string;

  supportedExtensions?: string[];

  required?: boolean;
  multiple?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const DocumentTypeSchema = new Schema<IDocumentType>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    section: {
      type: String,
      enum: ["resume", "document", "experience", "academic", "additional"],
      required: true,
      index: true,
    },

    subTitle: String,

    supportedExtensions: [String],

    required: {
      type: Boolean,
      default: false,
    },

    multiple: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const DocumentType =
  mongoose.models.DocumentType ||
  mongoose.model<IDocumentType>("DocumentType", DocumentTypeSchema);