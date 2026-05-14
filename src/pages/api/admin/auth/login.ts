import { applyCors } from "@/lib/cors";
import { ApiError } from "@/lib/error/api.error";
import connectToDatabase from "@/lib/mongodb";
import { adminLoginService } from "@/lib/services/admin/admin.service";
import ResponseHandler from "@/lib/utils/responseUtil";
import { adminLoginSchema } from "@/lib/validation/authValidation";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return ResponseHandler.sendError(res, 'Method not allowed', 405);
  }

  try {
    const { error } = adminLoginSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      throw new ApiError(message, 400);
    }

    const userData = await adminLoginService(req.body);
    return ResponseHandler.sendSuccess(
      res,
      userData,
      'You are successfully loggedIn'
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return ResponseHandler.sendError(
        res,
        error.message,
        error.statusCode
      );
    }

    return ResponseHandler.sendError(res, 'Unknown error occurred', 500);
  }
}

export default handler;