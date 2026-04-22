import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOtp extends Document {
  userId: Types.ObjectId;

  otp?: {
    code?: string; //hashed version will store
    expiresAt?: Date;
  };
}

const OtpSchema = new Schema<IOtp>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },

    otp: {
      code: String,
      expiresAt: Date,
    },
  },
  { timestamps: true }
);

export const Otp =
  mongoose.models.Otp ||
  mongoose.model<IOtp>("Otp", OtpSchema);