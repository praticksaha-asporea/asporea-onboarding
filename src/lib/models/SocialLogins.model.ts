import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISocialLogins extends Document {
  userId: Types.ObjectId;

  type: "google" | "facebook" | "instagram" | "linkedin";
  providerId: string;
  accessToken?: string;
  scopes?: string;
  expiresAt?: Date;
}

const UserSocialSchema = new Schema<ISocialLogins>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    type: {
      type: String,
      enum: ["google", "facebook", "instagram", "linkedin"],
    },
    providerId: {
      type: String,
      required: true,
    },
    accessToken: String,
    scopes: String,
    expiresAt: Date,
  },
  { timestamps: true }
);

export const SocialLogins =
  mongoose.models.SocialLogins ||
  mongoose.model<ISocialLogins>(
    "SocialLogins",
    UserSocialSchema
  );

  UserSocialSchema.index(
  { type: 1, providerId: 1 },
  { unique: true }
);