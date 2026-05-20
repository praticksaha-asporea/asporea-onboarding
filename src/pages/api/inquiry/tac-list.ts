import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from '@/lib/middleware/auth.middleware';
import { getTacListByBranch } from "@/lib/services/Inquiry/inquiry";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  if (req.method !== "GET")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError('Unauthenticated user', 401);
    await verifyToken(token);
    const branchId = req.query.branchId as string;
    if (!branchId) throw new ApiError("Branch ID parameter is missing", 400);

    const data = await getTacListByBranch(branchId);
    return ResponseHandler.sendSuccess(
      res,
      data,
      "TAC list fetched successfully",
    );
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
