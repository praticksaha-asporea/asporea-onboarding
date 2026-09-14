import { NextApiRequest, NextApiResponse } from "next";
import { applyCors } from "@/lib/cors";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import ResponseHandler from "@/lib/utils/responseUtil";
import { sendCandidateEmailService } from "@/lib/services/communication/send-email.service";

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
    if (!token) throw new ApiError("Unauthenticated user", 401);

    const authUser = await verifyToken(token);

    await sendCandidateEmailService(req.body, authUser);

    return ResponseHandler.sendSuccess(res, null, "Email sent successfully.");
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode);
    }
    console.error("SEND TAC EMAIL ERROR:", error);
    return ResponseHandler.sendError(
      res,
      "Failed to send email. Server error.",
      500,
    );
  }
}
