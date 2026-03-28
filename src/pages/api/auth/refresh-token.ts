import { NextApiRequest, NextApiResponse } from "next";
import { verifyRefreshToken, generateTokens } from "@/lib/utils/tokenUtil";
import User from "@/lib/models/User.model";
import ResponseHandler from "@/lib/utils/responseUtil";
import Token from "@/lib/models/Token.model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== "string") {
      return ResponseHandler.sendError(
        res,
        "Refresh token required or invalid refrsh token",
        400,
      );
    }

    const decoded: any = verifyRefreshToken(refreshToken);
    const tokenDoc = await Token.findOne({
      token:refreshToken,
      type:"refresh"
    });

    if(!tokenDoc) {
      return ResponseHandler.sendError(
        res,"Invalid refresh token (not found in DB)",
        401
      );
    }
    
    if (tokenDoc.expiresAt < new Date()) {
      return ResponseHandler.sendError(
        res,'Refresh Token expired',
        401
      );
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return ResponseHandler.sendError(res, "User not found", 404);
    }

    await Token.deleteOne({_id:tokenDoc._id})

    const tokens = await generateTokens(user);

    return ResponseHandler.sendSuccess(res, tokens, "Token refreshed");
  } catch (err) {
    return ResponseHandler.sendError(res, "Invalid refresh token", 401);
  }
}
