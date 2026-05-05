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

  let otpData;

  if (user) {
    // Registered: match by userId + code
    otpData = await Otp.findOne({
      userId: user._id,
      "otp.code": otp,
    });
  } else {
    // Guest: no userId on the doc, match by sentTo + code
    otpData = await Otp.findOne({
      userId: { $exists: false },
      "otp.code": otp,
      "otp.sentTo": normalizedIdentity,
    });
  }

  if (!otpData) {
    throw new ApiError("Invalid OTP", 400);
  }

  if (!otpData.otp?.expiresAt || otpData.otp.expiresAt < new Date()) {
    throw new ApiError("OTP expired", 400);
  }

  await Otp.deleteOne({ _id: otpData._id });

  if (!user) {
    return {
      user: null,
      isRegistered: false,
      verifiedIdentity: normalizedIdentity,
    };
  }

  const tokens = await generateTokens({
    _id: user._id,
    role: (user as any).role,
  });

  return {
    isRegistered: true,
    user: {
      id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      whatsappNumber: user.whatsappNumber,
      role: (user as any).role,
      hasPassword: !!user.password,
    },
    tokens,
  };
};