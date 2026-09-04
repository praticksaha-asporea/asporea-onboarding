import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { createTransferLeadService } from "@/lib/services/tac/transfer.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method !== "POST") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {

    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);


    if (authUser.role !== "tac") {
      throw new ApiError("Unauthorized access", 403);
    }

    const { leadId, toId, reason } = req.body;


    const newEscalation = await createTransferLeadService({
      fromId: authUser.id,
      toId,
      leadId,
      reason,
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