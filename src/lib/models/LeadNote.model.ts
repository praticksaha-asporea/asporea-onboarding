import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILeadNote extends Document {
    leadId: Types.ObjectId;
    authorId: Types.ObjectId;
    authorRole:
    | "admin"
    | "tac"
    | "manager"
    | "foe"
    | "branch_head"
    | "tac_head";
    note: string;
    createdAt: Date;
}

const LeadNoteSchema = new Schema<ILeadNote>(
    {
        leadId: {
            type: Schema.Types.ObjectId,
            ref: "Lead",
            required: true,
            index: true,
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        authorRole: {
            type: String,
            required: true,
        },
        note: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

LeadNoteSchema.index({ leadId: 1, createdAt: -1 });

export const LeadNote =
    (mongoose.models.LeadNote as mongoose.Model<ILeadNote>) ||
    mongoose.model<ILeadNote>("LeadNote", LeadNoteSchema);

export default LeadNote;