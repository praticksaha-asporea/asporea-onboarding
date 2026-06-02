import mongoose from "mongoose";
import { TechnicalDetailModel } from "@/lib/models/TechnicalDetail.model";
import { ApiError } from "@/lib/error/api.error";

export const addTechnicalResult = async (payload: any, userId?: string) => {
  const {
    leadId,
    assessmentId,
    achievedScore,
    totalScore,
    questions,
    answered,
    timeTaken,
  } = payload;

  const LeadModel = mongoose.models.Lead || mongoose.model("Lead");
  const lead = await LeadModel.findById(leadId);

  if (!lead) throw new ApiError("Lead not found", 404);

  const isPassed = achievedScore >= totalScore / 2;
  const status = isPassed ? "passed" : "failed";

  await LeadModel.findByIdAndUpdate(leadId, {
    "technical.status": status,
    "technical.required": true,
  });

  const techResult = await TechnicalDetailModel.create({
    leadId: new mongoose.Types.ObjectId(leadId),
    assessmentId: new mongoose.Types.ObjectId(assessmentId),
    achievedScore,
    totalScore,
    questions,
    answered,
    timeTaken,
    feedback: "Evaluated successfully based on e-assessment.",
  });

  return techResult;
};

export const getTechnicalResult = async (leadId: string) => {
  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError("Invalid Lead ID format", 400);
  }

  const result = await TechnicalDetailModel.findOne({
    leadId: new mongoose.Types.ObjectId(leadId),
  });

  if (!result) throw new ApiError("Result not found", 404);

  return result;
};
