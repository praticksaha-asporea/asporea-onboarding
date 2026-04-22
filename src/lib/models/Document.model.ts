import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDocument extends Document {
  leadId: Types.ObjectId;
  userId?: Types.ObjectId;

  typeId: Types.ObjectId;

  uploadId: Types.ObjectId;

  status?: "uploaded" | "verified" | "rejected";

  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    typeId: {
      type: Schema.Types.ObjectId,
      ref: "DocumentType",
      required: true,
      index: true,
    },

    uploadId: {
      type: Schema.Types.ObjectId,
      ref: "Upload",
      required: true,
    },

    status: {
      type: String,
      enum: ["uploaded", "verified", "rejected"],
      default: "uploaded",
      index: true,
    },
  },
  { timestamps: true }
);

/* INDEXES */
DocumentSchema.index({ leadId: 1, typeId: 1 });
DocumentSchema.index({ userId: 1 });
DocumentSchema.index({ status: 1 });

export const DocumentModel =
  mongoose.models.Document ||
  mongoose.model<IDocument>("Document", DocumentSchema);