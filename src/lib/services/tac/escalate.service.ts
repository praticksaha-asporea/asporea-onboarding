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
    status: { $in: ["requested", "approved"] } // 🎯 Dono status check ho rhe hain
  });

  if (existingEscalation) {
    if (existingEscalation.status === "requested") {
      // Agar abhi pending hai manager ke paas
      throw new ApiError("An escalation request for this lead is already pending manager approval.", 400);
    } else {
      // Agar pehle hi approve ho chuka hai (Tera naya rule)
      throw new ApiError("Escalation already raised and approved for this lead.", 400);
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