import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { getConsultantSlots } from "@/lib/services/PreCounselling/preCounselling.service";

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
    await verifyToken(token);

    const { consultantId, date } = req.query;

    if (!consultantId || !date) {
      throw new ApiError(
        "consultantId and date are required query parameters",
        400,
      );
    }

    const data = await getConsultantSlots(
      consultantId as string,
      date as string,
    );

    const message = data.length > 0 
      ? "Available slots fetched successfully" 
      : "No slots available for the selected date";

    return ResponseHandler.sendSuccess(
      res,
      data,
     message,
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode);
    }
    console.error("Slots API Error:", error);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
