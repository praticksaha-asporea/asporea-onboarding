import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { applyCors } from "@/lib/cors";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { deleteQuestion } from "@/lib/services/Assessments/question.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  if (req.method !== "DELETE")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    
    const authUser = await verifyToken(token);
    if (authUser.role !== "admin") throw new ApiError("Admin access required", 403);

    const { id } = req.query;
    if (!id) throw new ApiError("Question ID is required", 400);

    const response = await deleteQuestion(id as string);

    return ResponseHandler.sendSuccess(res, response, "Question deleted successfully");
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}