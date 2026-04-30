import { ApiError } from "@/lib/error/api.error";
import connectToDatabase from "@/lib/mongodb";
import { resetAdminPassword } from "@/lib/services/admin/admin.service";
import ResponseHandler from "@/lib/utils/responseUtil";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method == 'POST') {
    try {
      await resetAdminPassword(req.body);

      return ResponseHandler.sendSuccess(
        res,
        `Password reset successfully`,
      );
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        return ResponseHandler.sendError(
          res,
          error.message,
          error.statusCode,
          // error.data,
        );
      }

      return ResponseHandler.sendError(res, 'Unknown error occurred', 500);
    }
  } else {
    return ResponseHandler.sendError(res, 'Method not allowed', 405);
  }
}
export default handler;
