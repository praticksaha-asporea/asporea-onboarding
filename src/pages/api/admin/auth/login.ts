import { ApiError } from "@/lib/error/api.error";
import connectToDatabase from "@/lib/mongodb";
import { adminLoginService } from "@/lib/services/admin/admin.service";
import ResponseHandler from "@/lib/utils/responseUtil";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method !== 'POST') {
    return ResponseHandler.sendError(res, 'Method not allowed', 405);
  }

  try {
    const userData = await adminLoginService(req.body);
    return ResponseHandler.sendSuccess(
      res,
      userData,
    // {},
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