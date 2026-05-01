import { ApiError } from "@/lib/error/api.error";
import { getTokenFromHeader, verifyToken } from "@/lib/middleware/auth.middleware";
import connectToDatabase from "@/lib/mongodb";
import { changePassword } from "@/lib/services/auth/change-password";
import ResponseHandler from "@/lib/utils/responseUtil";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectToDatabase();

  if (req.method !== 'POST')
    return ResponseHandler.sendError(res, 'Method not allowed', 405);

  try {
    const token = getTokenFromHeader(req);
    // console.log(token);

    if (token === null) {
      throw new ApiError('Un-aunthentic user ', 400);
    }

    const authUser = await verifyToken(token);

    
    const payload = req.body?.userId ? req.body:{ ...req.body, userId: authUser.id };
    // console.log(payload,987);
    const profile = await changePassword(payload);

    return ResponseHandler.sendSuccess(
      res,
      profile,
      'Password change is successful',
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

    return ResponseHandler.sendError(res, 'Unknown error occurred', 500);
  }
}
