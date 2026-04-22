import mongoose, { Schema, Document, Types } from "mongoose";

export interface IToken extends Document {
  userId: Types.ObjectId;

  token: string;
  type: "access" | "refresh";
  expiresAt: Date;
}

const TokenSchema = new Schema<IToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    token: { type: String, required: true },

    type: {
      type: String,
      enum: ["access", "refresh"],
    },

    expiresAt: Date,
  },
  { timestamps: true }
);

export const Token =
  mongoose.models.Token ||
  mongoose.model<IToken>("Token", TokenSchema);

  TokenSchema.index({ userId: 1, type: 1 });