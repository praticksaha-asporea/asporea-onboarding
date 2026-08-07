import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITacRating extends Document {
    leadId: Types.ObjectId;
    phase: "pre" | "assess" | string;
    tacId: Types.ObjectId;
    ratedBy: Types.ObjectId;
    rating: number;
    review?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TacRatingSchema = new Schema<ITacRating>(
    {
        leadId: {
            type: Schema.Types.ObjectId,
            ref: "Lead",
            required: true,
            index: true,
        },
        phase: {
            type: String,
            required: true,
            index: true,
        },
        tacId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        ratedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        review: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { timestamps: true }
);

// Unique index: One Lead can have only one rating per phase by a specific TAC
TacRatingSchema.index({ leadId: 1, phase: 1 }, { unique: true });

export const TacRating =
    (mongoose.models.TacRating as mongoose.Model<ITacRating>) ||
    mongoose.model<ITacRating>("TacRating", TacRatingSchema);

export default TacRating;