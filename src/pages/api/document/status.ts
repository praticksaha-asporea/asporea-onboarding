import { NextApiRequest, NextApiResponse } from "next";
import { applyCors } from "@/lib/cors";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import ResponseHandler from "@/lib/utils/responseUtil";
import { getLeadDocumentStatusService } from "@/lib/services/document/get-lead-document-status.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (applyCors && applyCors(req, res)) return;

  if (req.method !== "GET") {
    return ResponseHandler.sendError(res, "Method not allowed", 405);
  }

  try {
    const token = getTokenFromHeader(req);
    if (token) {
      await verifyToken(token);
    }

    const leadId = req.query.leadId as string;
    const result = await getLeadDocumentStatusService(leadId);

    const message =
      result.realDocsCount === 0 ? "No documents found" : "Status fetched";

    return ResponseHandler.sendSuccess(res, result, message);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(
        res,
        error.message,
        error.statusCode,
        error.data,
      );
    }

    console.error("STATUS API ERROR:", error);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
