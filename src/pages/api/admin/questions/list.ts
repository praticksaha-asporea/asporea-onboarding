import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { applyCors } from "@/lib/cors";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { questionList } from "@/lib/services/Assessments/question.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  if (req.method !== "GET")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    
    const authUser = await verifyToken(token);
    if (authUser.role !== "admin") throw new ApiError("Admin access required", 403);

   
    const { keyword, section, page, limit,includeDeleted } = req.query;

    const data = await questionList({
      keyword: keyword as string,
      section: section as string,
      includeDeleted: includeDeleted as string,  
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 100,  
    });

    return ResponseHandler.sendSuccess(res, data, "Assessment questions fetched successfully");
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}