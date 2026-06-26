import mongoose from "mongoose";
import { TechnicalDetailModel } from "@/lib/models/TechnicalDetail.model";
import { ApiError } from "@/lib/error/api.error";
import { Assignment } from "@/lib/models/Assignment.model";
import { GeneralSettingModel } from "@/lib/models/GeneralSetting.model";

export const addTechnicalResult = async (payload: any) => {
  const {
    leadId,
    achievedScore,
    totalScore,
    timeTaken,
    questions,
    answered,
    type,
    breakdownPdf,
    feedback
  } = payload;

  const LeadModel = mongoose.models.Lead || mongoose.model("Lead");
  const lead = await LeadModel.findById(leadId);

  if (!lead) throw new ApiError("Lead not found", 404);
  const assignments = await Assignment.findOne({ leadId: new mongoose.Types.ObjectId(leadId), phase: 'assess' });
  // console.log({ leadId: new mongoose.Types.ObjectId(leadId), phase: 'assess' },assignments, 4544);
  if (!assignments) throw new ApiError("Assignment not found", 404);

  const generalSettings= await GeneralSettingModel.findOne().lean();

  const isPassed = await achievedScore >= generalSettings?.technical?.passingMarks;
  const statusTech = isPassed ? "passed" : "failed";

  await LeadModel.findByIdAndUpdate(leadId, {
    "technical.status": statusTech,
    "technical.type": type,
    "experience.status": isPassed ? "verified" : "rejected",
    "status": `exp_${isPassed ? "verified" : "rejected"}`
  });

  if (!isPassed) {
    await Assignment.findByIdAndUpdate(assignments?._id, {
      "status": "rejected"
    });
  }

  const techResult = await TechnicalDetailModel.create({
    leadId: new mongoose.Types.ObjectId(leadId),
    assignmentId: new mongoose.Types.ObjectId(assignments?._id),
    achievedScore,
    totalScore,
    questions,
    answered,
    timeTaken,
    breakdownPdf,
    status: statusTech,
    feedback,
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
