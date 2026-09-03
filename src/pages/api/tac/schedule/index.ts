import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import { getTacScheduleService } from "@/lib/services/tac/tacSchedule.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    const authUser = await verifyToken(token);
    
    if (authUser.role !== "tac") throw new ApiError("TAC access required", 403);

    if (req.method === "GET") {
      const { month, year } = req.query;

      if (!month || !year)
        throw new ApiError("Month and Year are required", 400);

      const result = await getTacScheduleService(
        authUser.id,
        Number(month),
        Number(year),
      );

      return ResponseHandler.sendSuccess(
        res,
        result,
        "Schedules fetched successfully",
      );
    }

    return ResponseHandler.sendError(res, "Method not allowed", 405);
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
