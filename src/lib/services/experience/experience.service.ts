import mongoose from "mongoose";
import { createLeadLogService } from "@/lib/services/leadActivity/leadLog.service";
import { ApiError } from "../../error/api.error";
import User from "@/lib/models/User.model";
export const saveExperienceTypeService = async (
  leadId: string,
  experienceType: string,
  userId?: string
) => {
  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError("Invalid Lead ID", 400);
  }

  if (!experienceType) {
    throw new ApiError("Experience Type is required", 400);
  }

  const LeadModel = mongoose.models.Lead || mongoose.model("Lead");

  
  const updatedLead = await LeadModel.findByIdAndUpdate(
    leadId,
    {
      $set: {
        status: "exp_submitted",
        "experience.type": experienceType,
        "experience.submittedOn": new Date(),
        "experience.status": 'selected',
        
      },
    },
    { new: true, runValidators: true }, 
  );

  if (!updatedLead) {
    throw new ApiError("Lead not found in the database", 404);
  }

  let roleLabel = "CANDIDATE";
  const performerId = userId || String(updatedLead.createdBy?.id || updatedLead.createdBy);

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    const actionUser = await User.findById(userId).select("role").lean();
    if (actionUser) {
      const rawRole = actionUser.role || "user";
      if (rawRole === "user") {
        roleLabel = "CANDIDATE";
      } else if (rawRole === "tac_head") {
        roleLabel = "TAC_HEAD";
      } else {
        roleLabel = rawRole.toUpperCase();
      }
    }
  }

  const formattedExpType =
    experienceType.charAt(0).toUpperCase() + experienceType.slice(1);
  const actionType = `EXPERIENCE_SUBMITTED_BY_${roleLabel}`;
  const actionNote = `Experience details submitted (${formattedExpType})`;

  await createLeadLogService(
    String(leadId),
    actionType,
    actionNote,
    performerId
  );

  return updatedLead;
};