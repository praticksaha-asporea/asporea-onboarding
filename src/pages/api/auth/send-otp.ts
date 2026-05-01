import { NextApiRequest, NextApiResponse } from "next";
import ResponseHandler from "@/lib/utils/responseUtil";
import connectToDatabase from "@/lib/mongodb";
import { phoneLoginSchema } from "@/lib/validation/authValidation";
import { sendOtpService } from "@/lib/services/auth/sendOtp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();
  try {
    const { error, value } = phoneLoginSchema.validate(req.body);
    if (error) {
      // console.log(error);
      
      return ResponseHandler.sendError(res, error.details[0].message, 400);
    }

    const { identity } = value;
    const result = await sendOtpService(identity);
    return ResponseHandler.sendSuccess(res, result, "Otp sent");
  } catch (err: any) {
    return ResponseHandler.sendError(res, err.message, 500);
  }
}
