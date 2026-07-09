import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { applyCors } from "@/lib/cors";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import { updateQuestion } from "@/lib/services/Assessments/question.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  if (req.method !== "PUT")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    
    const authUser = await verifyToken(token);
    if (authUser.role !== "admin") throw new ApiError("Admin access required", 403);

    // Frontend ki service me humne query url banaya tha: `?id=${id}`
    const { id } = req.query;
    if (!id) throw new ApiError("Question ID is required", 400);

    // Service call
    const updatedQuestion = await updateQuestion(id as string, req.body);

    return ResponseHandler.sendSuccess(res, updatedQuestion, "Question updated successfully");
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode, error.data);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}