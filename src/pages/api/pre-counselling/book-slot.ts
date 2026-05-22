import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { savePreCounsellingBooking } from "@/lib/services/PreCounselling/preCounselling.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();

  if (req.method !== "POST") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    await verifyToken(token);

    const data = await savePreCounsellingBooking(req.body);

    return ResponseHandler.sendSuccess(
      res,
      data,
      "Pre-Counselling session scheduled successfully",
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode);
    }
    console.error("Booking API Error:", error);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
