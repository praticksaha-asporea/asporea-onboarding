import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import {
  updatePathwayService,
  deletePathwayService,
  getPathwayByIdService,
} from "../../../../lib/services/admin/pathway.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);
    if (authUser.role !== "admin") throw new ApiError("Admin access required", 403);

    const { id } = req.query;

    if (req.method === "GET") {
      const result = await getPathwayByIdService(id as string);
      return ResponseHandler.sendSuccess(res, result, "Pathway fetched successfully");
    }

    if (req.method === "PUT") {
      const { title, underPathway, isActive } = req.body;
      const result = await updatePathwayService(id as string, { title, underPathway, isActive });
      return ResponseHandler.sendSuccess(res, result, "Pathway updated successfully");
    }

    if (req.method === "DELETE") {
      const result = await deletePathwayService(id as string);
      return ResponseHandler.sendSuccess(res, result, "Pathway deleted successfully");
    }

    return ResponseHandler.sendError(res, "Method not allowed", 405);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    }
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}