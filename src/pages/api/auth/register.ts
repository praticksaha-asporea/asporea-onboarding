import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import { register } from "@/lib/services/auth/register";
import { registerSchema } from "@/lib/validation/authValidation";
import ResponseHandler from "@/lib/utils/responseUtil";
import { ApiError } from "@/lib/error/api.error";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectDB();

  if (req.method !== "POST")
    return ResponseHandler.sendError(res, "Method not allowed", 405);

  try {
    const { error } = registerSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new ApiError(message, 400);
    }
    const newUser = await register(req.body);
    return ResponseHandler.sendSuccess(res, newUser, "Signup Successfull");
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(
        res,
        error.message || "unknown error",
        error.statusCode,
      );
    }
    return ResponseHandler.sendError(res, "Unknown Error Occurred", 500);
  }
}
