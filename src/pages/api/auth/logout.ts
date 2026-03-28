import { NextApiRequest, NextApiResponse } from "next";
import { logout } from "@/lib/services/auth/logout";
import ResponseHandler from "@/lib/utils/responseUtil";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== "POST") {
      return ResponseHandler.sendError(res, "Method not allowed", 405);
    }

    const { refreshToken } = req.body;
    const result = await logout(refreshToken);

    return ResponseHandler.sendSuccess(res, result, "Logout success");
  } catch (err: any) {
    return ResponseHandler.sendError(
      res,
      err.message || "Logout failed",
      err.statuscode || 500,
    );
  }
}
