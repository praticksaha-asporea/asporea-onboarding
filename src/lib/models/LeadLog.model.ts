import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILeadLog extends Document {
    leadId: Types.ObjectId;
    actionType: string;
    actionNote: string;
    actionBy?: Types.ObjectId;
    eventDate?: Date;
    createdAt: Date;
}

const LeadLogSchema = new Schema<ILeadLog>(
    {
        leadId: {
            type: Schema.Types.ObjectId,
            ref: "Lead",
            required: true,
            index: true,
        },
        actionType: {
            type: String,
            required: true,
            trim: true,
        },
        actionNote: {
            type: String,
            required: true,
            trim: true,
        },
        actionBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        eventDate: {
            type: Date,
            // default: Date.now,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

LeadLogSchema.index({ leadId: 1, createdAt: -1 });

export const LeadLog =
    (mongoose.models.LeadLog as mongoose.Model<ILeadLog>) ||
    mongoose.model<ILeadLog>("LeadLog", LeadLogSchema);

export default LeadLog;