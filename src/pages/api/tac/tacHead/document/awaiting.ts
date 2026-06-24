import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { getAwaitingApprovalDocumentsService } from "@/lib/services/tac_head/documents.service";

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

    const authUser = await verifyToken(token);
    const userRole = String(authUser.role).toLowerCase();

    // if (userRole === "user") {
    //   throw new ApiError(
    //     "Unauthorized access. Candidates cannot view document approvals.",
    //     403,
    //   );
    // }

    if (!["tac_head", "admin"].includes(userRole)) {
      throw new ApiError("Unauthorized access. Only TAC Head and Admin can view this.", 403);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const filterUserId =
      userRole === "admin" ? null : authUser.id || (authUser as any)._id;

    const result = await getAwaitingApprovalDocumentsService(
      page,
      limit,
      filterUserId,
      search,
    );

    return ResponseHandler.sendSuccess(
      res,
      result,
      "Awaiting approval documents fetched successfully.",
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode);
    }
    console.error("AWAITING DOCUMENTS API ERROR:", error);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
