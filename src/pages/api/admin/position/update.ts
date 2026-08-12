import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { updatePositionSchema } from "@/lib/validation/positionValidation";
import { updatePosition } from "@/lib/services/admin/position.service";
import { parseForm, normalizeFormFields } from "@/lib/utils/parseForm";
import { applyCors } from "@/lib/cors";

// Disable Next.js body parser — formidable handles multipart
export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 
  if (applyCors(req, res)) return;
  await connectToDatabase();

  if (req.method !== "PUT" && req.method !== "PATCH")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    const authUser = await verifyToken(token);
    if (authUser.role !== "admin") throw new ApiError("Admin access required", 403);

    const { fields } = await parseForm(req);
    const body = normalizeFormFields(
      fields,
      ["requiredDocuments", "mandatoryDocuments", "type", "programTypes", "countries"], // array fields
    );

    const { error, value } = updatePositionSchema.validate(body);
    if (error)
      throw new ApiError(error.details.map((d) => d.message).join(", "), 400);

    const { id, ...updateData } = value;
    const updated = await updatePosition(id, updateData);
    return ResponseHandler.sendSuccess(res, updated, "Position updated successfully");
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
