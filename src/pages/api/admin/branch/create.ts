import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { createBranch } from "@/lib/services/admin/branch.service";
import { createBranchSchema } from "@/lib/validation/branchValidation";
import { applyCors } from "@/lib/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  if (applyCors(req, res)) return;
  
  if (req.method !== "POST")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    const authUser = await verifyToken(token);
    if (authUser.role !== "admin")
      throw new ApiError("Admin access required", 403);

    const { error, value } = createBranchSchema.validate(req.body);
    if (error) {
      const message = error.details.map((d) => d.message).join(", ");
      throw new ApiError(message, 400);
    }

    const branch = await createBranch(value);
    return ResponseHandler.sendSuccess(
      res,
      branch,
      "Branch created successfully",
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
