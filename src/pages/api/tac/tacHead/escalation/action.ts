import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { updateTransferLeadStatusService } from "@/lib/services/tac/transfer.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();

  if (req.method !== "POST" && req.method !== "PUT") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);
    const userRole = String(authUser.role).toLowerCase();

    if (!["admin", "tac_head", "branch_head"].includes(userRole)) {
      throw new ApiError(
        "Unauthorized. Only managers/heads can approve escalations.",
        403,
      );
    }

    const { escalationId, status, remarks, schedule } = req.body;

    if (!escalationId || !status) {
      throw new ApiError("Escalation ID and Status are required", 400);
    }

    if (!["approved", "rejected"].includes(status)) {
      throw new ApiError("Status must be either 'approved' or 'rejected'", 400);
    }

    // if (status === "approved" && (!schedule || !schedule.date || !schedule.from || !schedule.to)) {
    //   throw new ApiError("New schedule (date, from, to) is required when approving an escalation.", 400);
    // }

    const updatedEscalation = await updateTransferLeadStatusService(
      escalationId,
      status,
      remarks,
      schedule
    );

    return ResponseHandler.sendSuccess(
      res,
      updatedEscalation,
      `Escalation request has been ${status} successfully.`,
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode);
    }
    console.error("ESCALATION ACTION API ERROR:", error);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
