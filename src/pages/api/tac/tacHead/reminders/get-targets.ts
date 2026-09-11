import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import { getReminderTargetsService } from "@/lib/services/tac_head/reminder.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();

  if (applyCors(req, res)) return;

  if (req.method !== "GET")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);
    if (authUser.role !== "tac_head" && authUser.role !== "admin") {
      throw new ApiError("TAC Head access required", 403);
    }

    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;
    if (!status) {
      throw new ApiError("Status query param is required", 400);
    }

    const data = await getReminderTargetsService(status, authUser.id);

    return ResponseHandler.sendSuccess(
      res,
      data,
      "Reminder targets fetched successfully",
    );
  } catch (error: unknown) {
    console.error("GET_TARGETS_ERROR:", error);
    if (error instanceof ApiError)
      return ResponseHandler.sendError(
        res,
        error.message,
        error.statusCode,
        error.data,
      );
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
