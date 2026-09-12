import { ApiError } from "@/lib/error/api.error";
import connectToDatabase from "@/lib/mongodb";
import Token from "@/lib/models/Token.model";
import User from "@/lib/models/User.model";
import { generateTokens, verifyRefreshToken } from "@/lib/utils/tokenUtil";

export const refreshTokenService = async (refreshToken?: string) => {
  if (!refreshToken || typeof refreshToken !== "string") {
    throw new ApiError("Refresh token required or invalid refresh token", 400);
  }

  await connectToDatabase();

  let decoded: any;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new ApiError("Invalid refresh token", 401);
  }

  const tokenDoc = await Token.findOne({
    token: refreshToken,
    type: "refresh",
  });

  if (!tokenDoc) {
    throw new ApiError("Invalid refresh token (not found in DB)", 401);
  }

  if (tokenDoc.expiresAt < new Date()) {
    throw new ApiError("Refresh Token expired", 401);
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  await Token.deleteOne({ _id: tokenDoc._id });

  const tokens = await generateTokens({
    _id: String(user._id),
    role: user?.role,
  });

  return tokens;
};
