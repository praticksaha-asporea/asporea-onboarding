import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { createAssignment } from "@/lib/services/admin/employeeAssignment.service";
import { createAssignmentSchema } from "@/lib/validation/employeeAssignmentValidation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  if (req.method !== "POST")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    const authUser = await verifyToken(token);
    if (authUser.role !== "admin")
      throw new ApiError("Admin access required", 403);

    const { error } = createAssignmentSchema.validate(req.body);
    if (error)
      throw new ApiError(error.details.map((d) => d.message).join(", "), 400);

    const assignment = await createAssignment(req.body);
    return ResponseHandler.sendSuccess(
      res,
      assignment,
      "Employee assigned successfully",
    );
  } catch (error: unknown) {
    console.log("ACTUAL ERROR: ", error)
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
