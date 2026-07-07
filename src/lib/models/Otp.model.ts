import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOtp extends Document {
  userId: Types.ObjectId;

  otp?: {
    code?: string; //hashed version will store
    expiresAt?: Date;
    sentTo?: string;
    sentAt?: Date;    
  };
}

const OtpSchema = new Schema<IOtp>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      unique: true,
      sparse: true,
    },

    otp: {
      code: String,
      expiresAt: Date,
      sentTo: String,
      channel: String,
      sentAt: { type: Date }
    },
  },
  { timestamps: true }
);

export const Otp =
  mongoose.models.Otp ||
  mongoose.model<IOtp>("Otp", OtpSchema);