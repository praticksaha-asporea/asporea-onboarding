import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUpload extends Document {
  userId?: Types.ObjectId;

  publicId?: string;
  path: string;

  createdAt: Date;
  updatedAt: Date;
}

const UploadSchema = new Schema<IUpload>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    publicId: {
      type: String,
      trim: true,
    },

    path: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Upload =
  mongoose.models.Upload ||
  mongoose.model<IUpload>("Upload", UploadSchema);