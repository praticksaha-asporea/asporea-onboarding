import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { deleteAssignment } from "@/lib/services/admin/employeeAssignment.service";
import { applyCors } from "@/lib/cors";
import { deleteShift } from "@/lib/services/admin/shift.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  if (applyCors(req, res)) return;  
  if (req.method !== "DELETE")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    const authUser = await verifyToken(token);
    if (authUser.role !== "admin")
      throw new ApiError("Admin access required", 403);

    const shiftId = req.query.id as string;
    if (!shiftId) throw new ApiError("Shift ID is required", 400);

    const data = await deleteShift(shiftId);
    return ResponseHandler.sendSuccess(
      res,
      data,
      "Shift deleted successfully",
    );
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(
        res,
        error.message,
        error.statusCode,
        error.data,
      );
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
