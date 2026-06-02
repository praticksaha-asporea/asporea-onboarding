import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import { Assignment } from "@/lib/models/Assignment.model";
import mongoose from "mongoose";
import Joi from "joi";
import { normalizeFormFields, parseForm } from "@/lib/utils/parseForm";
import { uploadFileService } from "@/lib/services/upload.service";
import { Lead } from "@/lib/models/Lead.model";


const updateAssignmentSchema = Joi.object({
  assignmentId: Joi.string()
    .hex()
    .length(24)
    .required(),

  preStatus: Joi.string()
    .valid(
      "assigned",
      "contacted",
      "na",
      "queued",
      "completed",
      "rejected",
      "not_responded"
    )
    .optional(),

  additionalDetails: Joi.string()
    .trim()
    .allow("", null)
    .optional(),

  specificNotes: Joi.string()
    .trim()
    .allow("", null)
    .optional(),

  advice: Joi.string()
    .trim()
    .allow("", null)
    .optional(),
})
  .options({
    abortEarly: false,
    allowUnknown: true, // IMPORTANT for multipart/form-data
  });
export const config = { api: { bodyParser: false } };

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
    const { fields, files } = await parseForm(req);
    const body = normalizeFormFields(
      fields as any
    );
    const { error, value } = updateAssignmentSchema.validate(body);

    if (error)
      throw new ApiError(error.details.map((d) => d.message).join(", "), 400);

    const { assignmentId, status, additionalDetails, specificNotes, advice } = value;

    if (!mongoose.Types.ObjectId.isValid(assignmentId))
      throw new ApiError("Invalid assignment ID", 400);

    // Verify the assignment belongs to this TAC
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      assignedTo: new mongoose.Types.ObjectId(authUser.id),
    });
    if (!assignment) throw new ApiError("Assignment not found or not assigned to you", 404);
    // need to work on file upload
    type UploadResult = {
      uploadId: string;
      path: string;
    };

    let result: UploadResult | null = null;

    if (files?.resume) {

      result = await uploadFileService({
        file: files?.resume,
        userId: authUser?.id,
      });
    }

    // need to work here for update fields
    const update: Record<string, any> = {
      ...(status !== undefined && { status }),

      pre: {
        ...(additionalDetails !== undefined && {
          additionalDetails,
        }),

        ...(specificNotes !== undefined && {
          specificNotes,
        }),

        ...(advice !== undefined && {
          advice,
        }),

        ...(files && result?.uploadId !== undefined && {
          initialCV: result.uploadId,
        }),
      },
    };


    const updated = await Assignment.findByIdAndUpdate(
      assignmentId,
      { $set: update },
      { returnDocument: "after", runValidators: true },
    ).lean();
    // pre_scheduled <=  assigned
    // pre_contacted <= contacted
    // pre_queued <= queued
    // pre_not_responded <= not_responded
    // pre_completed <= completed
    // pre_rejected <= rejected
    const updatableStatus: Record<string, string> = {
      assigned: "pre_scheduled",
      contacted: "pre_contacted",
      queued: "pre_queued",
      not_responded: "pre_not_responded",
      completed: "pre_completed",
      rejected: "pre_rejected",
    };
    if (updatableStatus) {
      
      await Lead.findByIdAndUpdate(
        assignment?.leadId,
        { $set: { status: updatableStatus?.[status] } },
        {  returnDocument: "after",  runValidators: true }
      );
    }

    return ResponseHandler.sendSuccess(res, updated, "Assignment updated");
  } catch (error: unknown) {

    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
