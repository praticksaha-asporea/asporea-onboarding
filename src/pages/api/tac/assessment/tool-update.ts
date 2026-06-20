import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import Joi from "joi";
import { normalizeFormFields, parseForm } from "@/lib/utils/parseForm";
import { AssessmentUpdate } from "@/lib/services/Assessments/assessment-tool.service";


const updateAssignmentSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required(),
  passportNo: Joi.string()
    .trim()
    .allow("", null)
    .optional(),
  totalMarks: Joi.string()
    .required(),
  note1: Joi.string()
    .trim()
    .allow("", null)
    .optional(), note2: Joi.string()
      .trim()
      .allow("", null)
      .optional(),
  note3: Joi.string()
    .trim()
    .allow("", null)
    .optional(),
  note4: Joi.string()
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

    const updated = await AssessmentUpdate(value, authUser, files);
    if (updated) { ResponseHandler.sendSuccess(res, updated, 'Assignment Updated'); }
    return ResponseHandler.sendError(res, 'Unable to update', 400);
  } catch (error: unknown) {

    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
