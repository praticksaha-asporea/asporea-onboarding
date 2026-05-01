import Token from "@/lib/models/Token.model";
import { ApiError } from "@/lib/error/api.error";

export const logout = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new ApiError("Refresh Token Required", 400);
  }

  const existing = await Token.findOne({ token: refreshToken, type: "refresh" });
  if (!existing) {
    throw new ApiError("Already Logged Out or Invalid token", 401);
  }
  await Token.deleteOne({ token: refreshToken });

  return {
    message: "Logged Out Successfully",
  };
};
