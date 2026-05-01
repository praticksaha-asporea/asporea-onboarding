import { NextApiRequest, NextApiResponse } from "next";
import ResponseHandler from "@/lib/utils/responseUtil";
import connectToDatabase from "@/lib/mongodb";
import { verifyOtpSchema } from "@/lib/validation/authValidation";
import { verifyOtpService } from "@/lib/services/auth/verifyOtp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  try {
    const { error, value } = verifyOtpSchema.validate(req.body);
    if (error) {
      return ResponseHandler.sendError(res, error.details[0].message, 400);
    }

    const { identity, otp } = value;
    const data = await verifyOtpService(identity, otp);
    return ResponseHandler.sendSuccess(res, data, "Login Success");
  } catch (err: any) {
    return ResponseHandler.sendError(res, err.message, err.statuscode || 500);
  }
}
