import { ApiError } from "@/lib/error/api.error";
import { EscalationModel } from "@/lib/models/Escalation.model";
import { Lead } from "@/lib/models/Lead.model";
import mongoose from "mongoose";

export const createEscalationService = async (
    payload: {
        fromId: string,
        leadId: string,
        reason: string,
        status: string
    }
) => {
    const { fromId, leadId, reason, status } = payload;
    if (!leadId || !mongoose.Types.ObjectId.isValid(leadId)) {
        throw new ApiError("Valid Lead ID is required", 400);
    }

    if (!fromId || !mongoose.Types.ObjectId.isValid(fromId)) {
        throw new ApiError("Valid fromId is required", 400);
    }
    if (!reason) {
        throw new ApiError("Valid reason is required", 400);
    }
    if (!status) {
        throw new ApiError("Valid status is required", 400);
    }


    const leadObjectId = new mongoose.Types.ObjectId(leadId);

    const existing = await EscalationModel.findOne({
        leadId: leadObjectId,
        status: "requested"
    }).lean();

    if (existing) {
        throw new ApiError("This inquiry has already been escalated and its pending for approval", 409);
    }

    await Lead.updateOne({
        _id: leadObjectId,
    }, {
        escalated: true
    })

    return await EscalationModel.create({
        leadId: new mongoose.Types.ObjectId(leadId),
        fromId: new mongoose.Types.ObjectId(fromId),
        reason,
        status
    });
};


export const getEscalationList = async (payload: { leadId: string; }) => {
    const escalations = await EscalationModel.find(payload)
        .populate("fromId", "firstName lastName role counterNo")
        .lean();
    return escalations;
};