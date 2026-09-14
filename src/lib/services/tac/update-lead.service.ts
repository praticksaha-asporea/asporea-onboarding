import mongoose from "mongoose";
import { ValidationErrorItem } from "joi";
import { ApiError } from "@/lib/error/api.error";
import connectToDatabase from "@/lib/mongodb";
import { Lead } from "@/lib/models/Lead.model";
import User from "@/lib/models/User.model";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import { updateLeadSchema } from "@/lib/validation/tacLeadValidation";

export interface IUpdateLeadPayload {
  id?: string;
  followUpRequired?: boolean;
  fullName?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  passportStatus?: "having" | "applied" | "no";
  passportNo?: string;
  inqForType?: string;
  inqForPosition?: string;
  nationality?: string;
  latestAcademic?: string;
  latestTechnical?: string;
  workExperience?: string;
  [key: string]: any;
}

export interface IAuthUserContext {
  id: string;
  role: string;
  [key: string]: any;
}

export const updateLeadService = async (
  payload: IUpdateLeadPayload,
  authUser: IAuthUserContext,
) => {
  if (authUser.role !== "tac" && authUser.role !== "foe") {
    throw new ApiError("TAC or FOE access required", 403);
  }

  const { error, value } = updateLeadSchema.validate(payload);
  if (error) {
    const message = error.details
      .map((d: ValidationErrorItem) => d.message)
      .join(", ");
    throw new ApiError(message, 400);
  }

  const {
    id,
    followUpRequired,
    fullName,
    email,
    phone,
    whatsapp,
    address,
    passportStatus,
    passportNo,
    inqForType,
    inqForPosition,
    nationality,
    latestAcademic,
    latestTechnical,
    workExperience,
  } = value;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError("Invalid lead ID", 400);
  }

  await connectToDatabase();

  let leadFilter: Record<string, unknown> = {
    _id: new mongoose.Types.ObjectId(id),
  };

  if (authUser.role === "foe") {
    const shift = await EmployeeBranchShiftModel.findOne({
      employeeId: new mongoose.Types.ObjectId(authUser.id),
    }).lean();

    if (!shift) throw new ApiError("FOE branch assignment not found", 404);
    leadFilter["preferences.branchId"] = shift.branchId;
  } else {
    leadFilter["preferences.consultantId"] = new mongoose.Types.ObjectId(
      authUser.id,
    );
  }

  // Ensure this lead is assigned to the requesting TAC/FOE
  const lead = await Lead.findOne(leadFilter);
  if (!lead) throw new ApiError("Lead not found or not accessible to you", 404);

  const update: Record<string, unknown> = {};
  if (followUpRequired !== undefined)
    update.followUpRequired = followUpRequired;
  if (fullName !== undefined) update.fullName = fullName;
  if (address !== undefined) update.address = address;
  if (email !== undefined) update["contact.email"] = email;
  if (phone !== undefined) update["contact.phone"] = phone;
  if (whatsapp !== undefined) update["contact.whatsapp"] = whatsapp;
  if (passportStatus !== undefined) update["passport.status"] = passportStatus;
  if (passportNo !== undefined) update["passport.no"] = passportNo;
  if (inqForType !== undefined) update.inqForType = inqForType;
  if (inqForPosition !== undefined) update.inqForPosition = inqForPosition;

  const updateUser: Record<string, unknown> = {};
  if (nationality !== undefined) {
    updateUser["candidateProfile.nationality"] = nationality;
  }
  if (latestAcademic !== undefined) {
    updateUser["candidateProfile.academic"] = latestAcademic;
  }
  if (latestTechnical !== undefined) {
    updateUser["candidateProfile.technicalQualification"] = latestTechnical;
  }
  if (workExperience !== undefined) {
    updateUser["candidateProfile.workExp"] = workExperience;
  }

  const updatedLead = await Lead.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true, runValidators: true },
  ).lean();

  const updatedUser = await User.findOneAndUpdate(
    { "candidateProfile.leadId": id },
    { $set: updateUser },
    { new: true, runValidators: true },
  ).lean();

  return { lead: updatedLead, user: updatedUser };
};
