import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import {
  getUploadsList,
  deleteUploadById,
} from "@/lib/services/admin/upload.service";
import { applyCors } from "@/lib/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated access", 401);

    const authUser = await verifyToken(token);

    if (authUser.role !== "admin") {
      throw new ApiError("Unauthorized: Admin access only", 403);
    }

    if (req.method === "GET") {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const role = req.query.role as string;
      const userId = req.query.userId as string;  

      const uploads = await getUploadsList({ page, limit, role,userId });

      return ResponseHandler.sendSuccess(
        res,
        uploads,
        "Uploads fetched successfully",
      );
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) throw new ApiError("Upload ID is required", 400);

      await deleteUploadById(id as string);

      return ResponseHandler.sendSuccess(
        res,
        null,
        "Upload deleted successfully from database and server",
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
