import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User.model";
import { SocialLogins } from "@/lib/models/SocialLogins.model";
import { generateTokens } from "@/lib/utils/tokenUtil";

export type SocialProvider = "google" | "facebook" | "linkedin";

export interface IHandleSocialSignInPayload {
  email: string | null;
  firstName: string;
  lastName: string;
  providerId: string;
  provider: SocialProvider;
  accessToken?: string;
  scopes?: string;
  expiresAt?: Date;
}

export const handleSocialSignInService = async ({
  email,
  firstName,
  lastName,
  providerId,
  provider,
  accessToken,
  scopes,
  expiresAt,
}: IHandleSocialSignInPayload) => {
  await connectToDatabase();

  // 1. Check if this social account is already linked
  let socialRecord = await SocialLogins.findOne({ type: provider, providerId });
  let dbUser: any;
  let tokens;

  if (socialRecord) {
    // Known social login — load linked user and refresh tokens
    dbUser = await User.findById(socialRecord.userId);

    if (dbUser) {
      await SocialLogins.findByIdAndUpdate(socialRecord._id, {
        accessToken,
        scopes,
        expiresAt,
      });
      tokens = await generateTokens({
        _id: String(dbUser._id),
        role: String(dbUser.role ?? "user"),
      });

      return {
        appTokens: tokens,
        appUserId: String(dbUser._id),
        appUserRole: String(dbUser.role ?? "user"),
        isNewUser: false,
        userData: dbUser.toObject(),
      };
    }
  }

  if (email) {
    // Check if user exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Existing user — link this social account and generate tokens
      if (!socialRecord) {
        await SocialLogins.create({
          userId: existingUser._id,
          type: provider,
          providerId,
          accessToken,
          scopes,
          expiresAt,
        });
      }
      tokens = await generateTokens({
        _id: String(existingUser._id),
        role: String(existingUser.role ?? "user"),
      });
      return {
        appTokens: tokens,
        appUserId: String(existingUser._id),
        appUserRole: String(existingUser.role ?? "user"),
        isNewUser: false,
        userData: existingUser.toObject(),
      };
    }
  }

  // New user — not in DB yet, return profile data for complete-profile flow
  return {
    appTokens: undefined,
    appUserId: undefined,
    appUserRole: "user",
    isNewUser: true,
    userData: { email, firstName, lastName, provider, providerId },
  };
};
