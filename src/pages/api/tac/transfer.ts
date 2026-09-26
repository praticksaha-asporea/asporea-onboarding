import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { createTransferLeadService } from "@/lib/services/tac/escalation.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method !== "POST") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {

    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);


    const allowedRoles = ["tac", "tac_head", "admin"];
    if (!allowedRoles.includes(authUser.role)) {
      throw new ApiError("Unauthorized access", 403);
    }
    const { leadId, toId, reason } = req.body;


    const newEscalation = await createTransferLeadService({
      fromId: authUser.id,
      toId,
      leadId,
      reason,
      performerRole: authUser.role,
    });

    // 3. Success Response
    return ResponseHandler.sendSuccess(
      res,
      newEscalation,
      "Lead transferred successfully to selected TAC."
    );

  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode);
    }
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}