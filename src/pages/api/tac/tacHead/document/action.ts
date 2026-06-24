import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import Joi from "joi";

 
import { approveRejectDocumentService } from "@/lib/services/tac_head/documents.service";

const tacHeadDocActionSchema = Joi.object({
  leadId: Joi.string().hex().length(24).required(),
  status: Joi.string().valid("verified", "rejected").required(),
  remarks: Joi.string().allow("", null).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (applyCors(req, res)) return;
  await connectToDatabase();

  if (req.method !== "POST")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);
    const userRole = String(authUser.role).toLowerCase();

    if (!["tac_head", "admin"].includes(userRole)) {
      throw new ApiError("Unauthorized access. TAC Head access required.", 403);
    }

    const { error, value } = tacHeadDocActionSchema.validate(req.body);
    if (error) throw new ApiError(error.details.map((d) => d.message).join(", "), 400);

    const { leadId, status, remarks } = value;

     
    const updatedLead = await approveRejectDocumentService(leadId, status, remarks);

    return ResponseHandler.sendSuccess(res, updatedLead, `Documents successfully ${status} by TAC Head`);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    }
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}