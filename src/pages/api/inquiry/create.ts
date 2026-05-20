import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";
import {
  getTokenFromHeader,
  verifyToken,
} from "@/lib/middleware/auth.middleware";
import { createInquiry } from "@/lib/services/Inquiry/inquiry";
import { createInquirySchema } from "@/lib/validation/inquiryValidation";

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

    const { error } = createInquirySchema.validate(req.body);
    if (error)
      throw new ApiError(error.details.map((d) => d.message).join(", "), 400);

    const data = await createInquiry(req.body, authUser.id);
    return ResponseHandler.sendSuccess(
      res,
      data,
      "Inquiry registered successfully",
    );
  } catch (error: unknown) {
    if (error instanceof ApiError)
      return ResponseHandler.sendError(res, error.message, error.statusCode);
    return ResponseHandler.sendError(res, "Unknown error occurred", 500);
  }
}
