import mongoose, { Schema, Document } from "mongoose";

export interface IToken extends Document {
  user: mongoose.Types.ObjectId;
  token: string;
  type: "access" | "refresh";
  expiresAt: Date;
}

const TokenSchema = new Schema<IToken>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", 
    },
    token: { type: String, required: true },
    type: {
      type: String,
      enum: ["access", "refresh"],
      required: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

const Token =
  mongoose.models.Token || mongoose.model<IToken>("Token", TokenSchema);

export default Token;
