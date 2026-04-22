import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBranchToken extends Document {
  tokenNo: string;

  branchId: Types.ObjectId;
  userId?: Types.ObjectId;

  generateDate: Date;

  status?: "generated" | "queued" | "finished";

  generatedBy?: "user" | "reception";

  createdAt: Date;
  updatedAt: Date;
}

const BranchTokenSchema = new Schema<IBranchToken>(
  {
    tokenNo: {
      type: String,
      required: true,
      trim: true,
    },

    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    generateDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    status: {
      type: String,
      enum: ["generated", "queued", "finished"],
      default: "generated",
      index: true,
    },

    generatedBy: {
      type: String,
      enum: ["user", "reception"],
      default: "user",
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */

// unique token per branch per day
BranchTokenSchema.index(
  { branchId: 1, tokenNo: 1, generateDate: 1 },
  { unique: true }
);

// fast queue queries
BranchTokenSchema.index({ branchId: 1, status: 1 });

/* ================= EXPORT ================= */

export const BranchTokenModel =
  mongoose.models.BranchToken ||
  mongoose.model<IBranchToken>("BranchToken", BranchTokenSchema);