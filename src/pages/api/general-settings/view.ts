import { NextApiRequest, NextApiResponse } from "next";
import { applyCors } from "@/lib/cors";
import { ApiError } from "@/lib/error/api.error";
import ResponseHandler from "@/lib/utils/responseUtil";
import { getGeneralSettingsService } from "@/lib/services/settings/get-general-settings.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (applyCors && applyCors(req, res)) return;

  if (req.method !== "GET") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const settings = await getGeneralSettingsService();

    return ResponseHandler.sendSuccess(
      res,
      settings,
      "General settings fetched"
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(
        res,
        error.message,
        error.statusCode,
        error.data
      );
    }

    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}