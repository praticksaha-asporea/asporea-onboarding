import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import { Lead } from "@/lib/models/Lead.model";
import { EmployeeBranchShiftModel } from "@/lib/models/EmployeeBranchShift.model";
import mongoose from "mongoose";
import Joi from "joi";
import User from "@/lib/models/User.model";

const updateLeadSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  followUpRequired: Joi.boolean().optional(),
  fullName: Joi.string().trim().optional(),
  email: Joi.string().email().lowercase().trim().optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
    "string.pattern.base": "Phone must be exactly 10 digits",
  }),
  whatsapp: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
    "string.pattern.base": "WhatsApp must be exactly 10 digits",
  }),
  address: Joi.string().trim().optional(),
  passportStatus: Joi.string().valid("having", "applied", "no").optional(),
  passportNo: Joi.string().trim().max(20).when("passportStatus", {
    is: "having",
    then: Joi.required().messages({ "any.required": "Passport number is required when status is Having" }),
    otherwise: Joi.optional().allow("", null),
  }),
  inqForType: Joi.string().trim().when("followUpRequired", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  inqForPosition: Joi.string().trim().when("followUpRequired", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  nationality: Joi.string().trim().when("followUpRequired", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  latestAcademic: Joi.string().trim().when("followUpRequired", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  latestTechnical: Joi.string().trim().when("followUpRequired", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  workExperience: Joi.string().trim().when("followUpRequired", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
}).options({ abortEarly: false, allowUnknown: false });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  if (req.method !== "PATCH" && req.method !== "PUT")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);
    if (authUser.role !== "tac" && authUser.role !== "foe") throw new ApiError("TAC or FOE   access required", 403);

    const { error, value } = updateLeadSchema.validate(req.body);

    if (error)
      throw new ApiError(error.details.map((d) => d.message).join(", "), 400);

    const { id,followUpRequired, fullName, email, phone, whatsapp, address, passportStatus, passportNo,
      inqForType, inqForPosition, nationality, latestAcademic, latestTechnical, workExperience } = value;

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new ApiError("Invalid lead ID", 400);

    let leadFilter: Record<string, unknown> = { _id: new mongoose.Types.ObjectId(id) };

    if (authUser.role === "foe") {
      const shift = await EmployeeBranchShiftModel.findOne({ employeeId: new mongoose.Types.ObjectId(authUser.id) }).lean();
      if (!shift) throw new ApiError("FOE branch assignment not found", 404);
      leadFilter["preferences.branchId"] = shift.branchId;
    } else {
      leadFilter["preferences.consultantId"] = new mongoose.Types.ObjectId(authUser.id);
    }

    // Ensure this lead is assigned to the requesting TAC
    const lead = await Lead.findOne(leadFilter);
    if (!lead) throw new ApiError("Lead not found or not accessible to you", 404);

    const update: Record<string, unknown> = {};
    if (followUpRequired !== undefined) update.followUpRequired = followUpRequired;
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

    const updated = await Lead.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true },
    ).lean();

    const user = await User.findOneAndUpdate({
      "candidateProfile.leadId": id
    },
      { $set: updateUser },
      { new: true, runValidators: true },
    ).lean();

    return ResponseHandler.sendSuccess(res, { lead: updated, user }, "Lead updated successfully");
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
