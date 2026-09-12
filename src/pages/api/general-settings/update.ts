import { NextApiRequest, NextApiResponse } from "next";
import { applyCors } from "@/lib/cors";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import ResponseHandler from "@/lib/utils/responseUtil";
import { updateGeneralSettingsService } from "@/lib/services/settings/update-general-settings.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (applyCors && applyCors(req, res)) return;

  if (req.method !== "PATCH" && req.method !== "PUT") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);

    const updated = await updateGeneralSettingsService(
      req.body,
      authUser?.role,
    );

    return ResponseHandler.sendSuccess(
      res,
      updated,
      "General settings updated",
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(
        res,
        error.message,
        error.statusCode,
        error.data,
      );
    }

    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
