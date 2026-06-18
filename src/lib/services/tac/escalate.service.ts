import { EscalationReportModel } from "@/lib/models/EscalationReport.model";
import { ApiError } from "@/lib/error/api.error";

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
    status: { $in: ["requested", "approved"] }  
  });

  if (existingEscalation) {
    if (existingEscalation.status === "requested") {
      
      throw new ApiError("Escalation request already submitted and awaiting manager approval.", 400);
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

  return newEscalation;
};