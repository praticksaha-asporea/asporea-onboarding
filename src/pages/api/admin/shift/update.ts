import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { updateShift } from "@/lib/services/admin/shift.service";
import { updateShiftSchema } from "@/lib/validation/shiftValidation";
import { applyCors } from "@/lib/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
    if (applyCors(req, res)) return;
  
  if (req.method !== "PUT" && req.method !== "PATCH")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    const authUser = await verifyToken(token);
    if (authUser.role !== "admin")
      throw new ApiError("Admin access required", 403);

    const { error } = updateShiftSchema.validate(req.body);
    if (error)
      throw new ApiError(error.details.map((d) => d.message).join(", "), 400);

    const shiftId = req.body.id as string;
    const updated = await updateShift(shiftId, req.body);

    return ResponseHandler.sendSuccess(
      res,
      updated,
      "Shift updated successfully",
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
