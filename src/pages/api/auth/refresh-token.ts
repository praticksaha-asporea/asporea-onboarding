import { NextApiRequest, NextApiResponse } from "next";
import { applyCors } from "@/lib/cors";
import { ApiError } from "@/lib/error/api.error";
import ResponseHandler from "@/lib/utils/responseUtil";
import { refreshTokenService } from "@/lib/services/auth/refresh-token.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const tokens = await refreshTokenService(req.body?.refreshToken);

    return ResponseHandler.sendSuccess(res, tokens, "Token refreshed");
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(
        res,
        error.message,
        error.statusCode,
        error.data,
      );
    }

    return ResponseHandler.sendError(res, "Invalid refresh token", 401);
  }
}
