import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { getPreCounsellingBooking } from "@/lib/services/PreCounselling/preCounselling.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  if (req.method !== "GET")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    await verifyToken(token);

    const { leadId } = req.query;
    if (!leadId) throw new ApiError("leadId is required", 400);

    const data = await getPreCounsellingBooking(leadId as string);

    return ResponseHandler.sendSuccess(res, data, "Booking status fetched");
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
