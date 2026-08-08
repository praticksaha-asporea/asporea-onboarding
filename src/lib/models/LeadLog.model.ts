import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILeadLog extends Document {
    leadId: Types.ObjectId;
    actionType: string;
    actionNote: string;
    actionBy?: Types.ObjectId;        
    triggeredBy: "USER" | "SYSTEM";   
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
        triggeredBy: {                  
            type: String,
            enum: ["USER", "SYSTEM"],
            required: true,
            default: "SYSTEM",
        },
        eventDate: {
            type: Date,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Indexes
LeadLogSchema.index({ leadId: 1, createdAt: -1 });
LeadLogSchema.index({ leadId: 1, triggeredBy: 1 }); 

export const LeadLog =
    (mongoose.models.LeadLog as mongoose.Model<ILeadLog>) ||
    mongoose.model<ILeadLog>("LeadLog", LeadLogSchema);

export default LeadLog;