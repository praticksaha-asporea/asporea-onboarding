import { EscalationReportModel } from "@/lib/models/EscalationReport.model";
import { Assignment } from "@/lib/models/Assignment.model";  
import { Lead } from "@/lib/models/Lead.model";
import { ApiError } from "@/lib/error/api.error";
import mongoose from "mongoose";

interface EscalatePayload {
  fromId: string;
  toId: string;
  leadId: string;
  reason: string;
}

export const createEscalationService = async (payload: EscalatePayload) => {
  const { fromId, toId, leadId, reason } = payload;

  if (!leadId || !toId || !reason) {
    throw new ApiError("Lead ID, Escalation TAC, and Reason are required", 400);
  }

  const existingEscalation = await EscalationReportModel.findOne({
    leadId,
    status: { $in: ["requested", "approved"] },
  });

  if (existingEscalation) {
    if (existingEscalation.status === "requested") {
      throw new ApiError(
        "Escalation request already submitted and awaiting manager approval.",
        400,
      );
    } else {
      throw new ApiError("This candidate has a history of escalation.", 400);
    }
  }
  const newEscalation = await EscalationReportModel.create({
    fromId,
    toId,
    leadId,
    reason,
    status: "requested",
  });

  await Assignment.updateMany(
    { leadId: leadId, assignedTo: fromId },  
    {
      $set: {
        "escalation.requested": true,
        "escalation.escalatedTo": toId,
      }
    }
  );

  return newEscalation;
};

export const getEscalationListService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const totalRecords = await EscalationReportModel.countDocuments();

  const escalations = await EscalationReportModel.find()
    .select("-reason")
    .populate({
      path: "fromId",
      select: "firstName lastName email role",
    })
    .populate({
      path: "toId",
      select: "firstName lastName email role",
    })
    .populate("leadId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    escalations,
    meta: {
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
    },
  };
};

export const getEscalationByIdService = async (escalationId: string) => {
  if (!escalationId || !mongoose.Types.ObjectId.isValid(escalationId)) {
    throw new ApiError("Valid Escalation ID is required", 400);
  }

  const escalation = await EscalationReportModel.findById(escalationId)
    
    .populate({
      path: "fromId",
      select: "firstName lastName email role phoneNumber whatsappNumber", 
    })
    .populate({
      path: "toId",
      select: "firstName lastName email role phoneNumber whatsappNumber",  
    })
    .populate("leadId") 
    .lean();

  if (!escalation) {
    throw new ApiError("Escalation record not found", 404);
  }

  return escalation;
};

export const updateEscalationStatusService = async (
  escalationId: string, 
  status: "approved" | "rejected", 
  remarks?: string
) => {
   
  const escalation = await EscalationReportModel.findById(escalationId);
  
  if (!escalation) throw new ApiError("Escalation record not found", 404);
  if (escalation.status !== "requested") {
    throw new ApiError(`Cannot update. Request is already ${escalation.status}`, 400);
  }

   
  escalation.status = status;
  if (remarks) escalation.remarks = remarks;
  escalation.actionedAt = new Date();
  await escalation.save();

  
  if (status === "approved") {
    
    
    await Lead.findByIdAndUpdate(escalation.leadId, {
      $set: {
        "preferences.consultantId": escalation.toId,  
        "escalatedTo": escalation.toId  
      }
    });

    
    await Assignment.updateMany(
      { leadId: escalation.leadId, assignedTo: escalation.fromId }, 
      {
        $set: {
          assignedTo: escalation.toId, 
          "escalation.requested": false,  
        },
        $unset: { 
          "escalation.escalatedTo": 1 
        }
      }
    );

  } 
  // IF REJECTED: Just clear the escalation flag from Assignment
  else if (status === "rejected") {
    await Assignment.updateMany(
      { leadId: escalation.leadId, assignedTo: escalation.fromId },
      {
        $set: { "escalation.requested": false },
        $unset: { "escalation.escalatedTo": 1 }  
      }
    );
  }

  return escalation;
};
