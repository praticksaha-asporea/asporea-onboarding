import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { applyCors } from "@/lib/cors";
import { getPathwaysService } from "@/lib/services/pathway/pathway.service";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { ApiError } from "@/lib/error/api.error";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();

  //   if (applyCors(req, res)) return;

  if (req.method !== "GET") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    await verifyToken(token);

    const data = await getPathwaysService(true);
    return ResponseHandler.sendSuccess(
      res,
      data,
      "Pathways fetched successfully",
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
