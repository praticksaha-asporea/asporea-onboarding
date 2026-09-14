import { NextApiRequest, NextApiResponse } from "next";
import { applyCors } from "@/lib/cors";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import ResponseHandler from "@/lib/utils/responseUtil";
import { submitDocumentsService } from "@/lib/services/document/submit-documents.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (applyCors && applyCors(req, res)) return;

  if (req.method !== "POST") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const token = getTokenFromHeader(req);
    const user = token ? await verifyToken(token) : null;

    const savedDocs = await submitDocumentsService(req.body, user?.id);

    return ResponseHandler.sendSuccess(
      res,
      savedDocs,
      "Documents mapped successfully",
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

    return ResponseHandler.sendError(
      res,
      (error as Error)?.message || "Save Error",
      500,
    );
  }
}
