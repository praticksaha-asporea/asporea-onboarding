import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import {
  foeSendCandidateOtpService,
  foeVerifyAndCreateCandidateService,
} from "@/lib/services/foe/foeCandidate.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();

  try {
    const token = getTokenFromHeader(req);
    if (!token) throw new ApiError("Unauthenticated user", 401);
    const authUser = await verifyToken(token);

    if (req.method === "PUT") {
      const result = await foeSendCandidateOtpService(req.body);
      return ResponseHandler.sendSuccess(
        res,
        result,
        "OTP sent to candidate successfully",
      );
    }

    if (req.method === "POST") {
      const data = await foeVerifyAndCreateCandidateService(
        req.body,
        authUser.id,
      );
      return ResponseHandler.sendSuccess(
        res,
        data,
        "Candidate & Inquiry registered successfully",
      );
    }

    return ResponseHandler.sendError(res, "Method not allowed", 405);
  } catch (error: unknown) {
    // console.log(error, 5135135);

    if (error instanceof ApiError) {
      return ResponseHandler.sendError(res, error.message, error.statusCode);
    }
    const errMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return ResponseHandler.sendError(res, errMessage, 500);
  }
}
