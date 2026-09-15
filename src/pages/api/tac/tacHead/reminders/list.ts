import { NextApiRequest, NextApiResponse } from "next";
import { applyCors } from "@/lib/cors";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import ResponseHandler from "@/lib/utils/responseUtil";
import { getRemindersListService } from "@/lib/services/tac_head/reminder.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (applyCors && applyCors(req, res)) return;

  if (req.method !== "GET") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);
    if (authUser.role !== "tac_head" && authUser.role !== "admin") {
      throw new ApiError("Unauthorized access", 403);
    }

    const data = await getRemindersListService(req.query);
    return ResponseHandler.sendSuccess(
      res,
      data,
      "Reminders list fetched successfully",
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(
        res,
        error.message,
        error.statusCode,
        error.data,
      );
    }
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
