import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import { Assignment } from "@/lib/models/Assignment.model";
import mongoose from "mongoose";
import Joi from "joi";

const updateAssignmentSchema = Joi.object({
  assignmentId: Joi.string().hex().length(24).required(),
  status: Joi.string()
    .valid("assigned", "contacted", "na", "queued", "completed", "rejected", "not_responded")
    .optional(),
  additionalDetails: Joi.string().trim().allow("", null).optional(),
  specificNotes:     Joi.string().trim().allow("", null).optional(),
  advice:            Joi.string().trim().allow("", null).optional(),
  attended:          Joi.boolean().optional(),
}).options({ abortEarly: false, allowUnknown: false });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (applyCors(req, res)) return;
  await connectToDatabase();

  if (req.method !== "PATCH" && req.method !== "PUT")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);
    if (authUser.role !== "tac") throw new ApiError("TAC access required", 403);

    const { error, value } = updateAssignmentSchema.validate(req.body);
    
    if (error)
      throw new ApiError(error.details.map((d) => d.message).join(", "), 400);

    const { assignmentId, status, additionalDetails, specificNotes, advice, attended } = value;

    if (!mongoose.Types.ObjectId.isValid(assignmentId))
      throw new ApiError("Invalid assignment ID", 400);

    // Verify the assignment belongs to this TAC
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      assignedTo: new mongoose.Types.ObjectId(authUser.id),
    });
    if (!assignment) throw new ApiError("Assignment not found or not assigned to you", 404);

    const update: Record<string, unknown> = {};
    if (status !== undefined)           update.status = status;
    if (attended !== undefined)         update.attended = attended;
    if (additionalDetails !== undefined) update.additionalDetails = additionalDetails;
    if (specificNotes !== undefined)    update.specificNotes = specificNotes;
    if (advice !== undefined)           update.advice = advice;

    const updated = await Assignment.findByIdAndUpdate(
      assignmentId,
      { $set: update },
      { returnDocument: "after", runValidators: true },
    ).lean();

    return ResponseHandler.sendSuccess(res, updated, "Assignment updated");
  } catch (error: unknown) {    
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
