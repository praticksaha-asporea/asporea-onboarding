import mongoose, { Schema, Document } from "mongoose";

export interface IPathway extends Document {
    title: string;
    underPathway: string;
    countryId: String;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PathwaySchema = new Schema<IPathway>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        underPathway: {
            type: String,
            default: "",
        },
        countryId: {
            type: Schema.Types.ObjectId,
            ref: "Country",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);


PathwaySchema.index({ title: 1, underPathway: 1 }, { unique: true });

export const Pathway =
    (mongoose.models.Pathway as mongoose.Model<IPathway>) ||
    mongoose.model<IPathway>("Pathway", PathwaySchema);

export default Pathway;