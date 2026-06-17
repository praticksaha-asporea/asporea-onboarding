import mongoose from "mongoose";

import { ApiError } from "../../error/api.error";

export const saveExperienceTypeService = async (
  leadId: string,
  experienceType: string,
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

  return updatedLead;
};
