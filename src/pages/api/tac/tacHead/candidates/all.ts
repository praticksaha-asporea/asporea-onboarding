import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { applyCors } from "@/lib/cors";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { getAllCandidatesForTacHead } from "@/lib/services/tac_head/candidate.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  if (req.method !== "GET") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);

    if (authUser.role !== "tac_head") {
      throw new ApiError("Access denied. Only TAC Head can view this.", 403);
    }

    const { branchId, tacId, page, limit ,search} = req.query;

    const result = await getAllCandidatesForTacHead(authUser.id, {
      branchId,
      tacId,
      page,
      limit,
      search
    });

    return ResponseHandler.sendSuccess(
      res,
      result,
      "All candidates fetched successfully",
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
    console.error("API Error [GetAllCandidates]:", error);
    return ResponseHandler.sendError(res, "Internal server error", 500);
  }
}
