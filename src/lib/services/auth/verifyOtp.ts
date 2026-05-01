import User from "@/lib/models/User.model";
import { Otp } from "@/lib/models/Otp.model";
import { generateTokens } from "@/lib/utils/tokenUtil";
import { ApiError } from "@/lib/error/api.error";

export const verifyOtpService = async (identity: string, otp: string) => {
  const normalizedIdentity = identity.trim();

  const user = await User.findOne({
    $or: [
      { email: normalizedIdentity },
      { phoneNumber: normalizedIdentity },
      { whatsappNumber: normalizedIdentity },
    ],
  }).select("email phoneNumber whatsappNumber role password");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const otpData = await Otp.findOne({
    userId: user._id,
    "otp.code": otp,
  });

  if (!otpData) {
    throw new ApiError("Invalid OTP", 400);
  }

  if (!otpData.otp?.expiresAt || otpData.otp.expiresAt < new Date()) {
    throw new ApiError("OTP expired", 400);
  }

  await Otp.deleteOne({ _id: otpData._id });

  const tokens = await generateTokens({
    _id: user._id,
    role: (user as any).role,
  });

  return {
    user: {
      id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      whatsappNumber: user.whatsappNumber,
      role: (user as any).role,
      hasPassword: user.password?true:false,
    },
    tokens,
  };
};