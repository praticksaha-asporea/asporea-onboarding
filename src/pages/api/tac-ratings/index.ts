import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import {
  createTacRatingService,
  getTacRatingsService,
} from "@/lib/services/tacRating/tacRating.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    const authUser = await verifyToken(token);

    // 1. SUBMIT PHASE RATING (POST)
    if (req.method === "POST") {
      const { leadId, phase, rating, review } = req.body;

      const result = await createTacRatingService(
        leadId,
        phase,
        Number(rating),
        review,
        authUser.id,
        authUser.role
      );

      return ResponseHandler.sendSuccess(res, result, "Rating submitted successfully", 201);
    }

    // 2. GET RATINGS & AVERAGE (GET)
    if (req.method === "GET") {
      const { leadId, tacId, phase } = req.query;

      const result = await getTacRatingsService({
        leadId: leadId as string,
        tacId: tacId as string,
        phase: phase as string,
      });

      return ResponseHandler.sendSuccess(res, result, "Ratings fetched successfully");
    }

    return ResponseHandler.sendError(res, "Method not allowed", 405);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    }
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}