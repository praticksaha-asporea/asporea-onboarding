import mongoose, { Schema, Document } from "mongoose";

export interface ICountry extends Document {
    name: string;
    code?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CountrySchema = new Schema<ICountry>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        code: {
            type: String,
            trim: true,
            uppercase: true,
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

CountrySchema.index({ name: 1 });

export const Country =
    (mongoose.models.Country as mongoose.Model<ICountry>) ||
    mongoose.model<ICountry>("Country", CountrySchema);

export default Country;