import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { getETransferLeadByIdService } from "@/lib/services/tac/transfer.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();

  if (req.method !== "GET") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);

    if (String(authUser.role).toLowerCase() === "user") {
      throw new ApiError(
        "Unauthorized access. Candidates cannot view escalation records.",
        403,
      );
    }

    const { id } = req.query;

    const escalationDetails = await getETransferLeadByIdService(id as string);

    return ResponseHandler.sendSuccess(
      res,
      escalationDetails,
      "Escalation details fetched successfully.",
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode);
    }
    console.error("INDIVIDUAL ESCALATION VIEW API ERROR:", error);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
