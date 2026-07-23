import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { applyCors } from "@/lib/cors";
import { externalSourceList } from "@/lib/services/admin/externalSource.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (applyCors(req, res)) return;
  await connectToDatabase();

    
  if (req.method !== "GET")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    
    const authUser = await verifyToken(token);
    if (authUser.role !== "admin") throw new ApiError("Admin access required", 403);

    
    const { search, type, keyword,status, page, limit } = req.query;

    const data = await externalSourceList({
        search: (search || keyword) as string,  
        status: status as string,
      type: type as string,
      keyword: keyword as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
    });
    
    return ResponseHandler.sendSuccess(res, data, "Sources fetched successfully");
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}