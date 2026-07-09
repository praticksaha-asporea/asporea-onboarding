import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import LinkedInProvider from "next-auth/providers/linkedin";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User.model";
import { SocialLogins } from "@/lib/models/SocialLogins.model";
import { generateTokens } from "@/lib/utils/tokenUtil";

type SocialProvider = "google" | "facebook" | "linkedin";

async function handleSocialSignIn({
  email, firstName, lastName, providerId, provider, accessToken, scopes, expiresAt,
}: {
  email: string | null;
  firstName: string;
  lastName: string;
  providerId: string;
  provider: SocialProvider;
  accessToken?: string;
  scopes?: string;
  expiresAt?: Date;
}) {
  await connectToDatabase();
  // 1. Check if this social account is already linked
  let socialRecord = await SocialLogins.findOne({ type: provider, providerId });
  let dbUser: any;
  let tokens;

  if (socialRecord) {
    // Known social login — load linked user and refresh tokens
    dbUser = await User.findById(socialRecord.userId);

    if (dbUser) {
      await SocialLogins.findByIdAndUpdate(socialRecord._id, { accessToken, scopes, expiresAt });
      tokens = await generateTokens({ _id: String(dbUser._id), role: String(dbUser.role ?? "user") });

      return { appTokens: tokens, appUserId: String(dbUser._id), appUserRole: String(dbUser.role ?? "user"), isNewUser: false, userData: dbUser.toObject() };
    }
  }

  if (email) {
    // Check if user exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Existing user — link this social account and generate tokens
      if (!socialRecord) {
        await SocialLogins.create({ userId: existingUser._id, type: provider, providerId, accessToken, scopes, expiresAt });
      }
      tokens = await generateTokens({ _id: String(existingUser._id), role: String(existingUser.role ?? "user") });
      return { appTokens: tokens, appUserId: String(existingUser._id), appUserRole: String(existingUser.role ?? "user"), isNewUser: false, userData: existingUser.toObject() };
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
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
      authorization: { params: { scope: "openid profile email" } },
      issuer: "https://www.linkedin.com/oauth",
      jwks_endpoint: 'https://www.linkedin.com/oauth/openid/jwks',
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account) return false;

      const provider = account.provider as SocialProvider;
      const providerId = account.providerAccountId;
      const firstName = (profile as any)?.given_name ?? (profile as any)?.first_name ?? (user.name ?? "").split(" ")[0] ?? "";
      const lastName = (profile as any)?.family_name ?? (profile as any)?.last_name ?? (user.name ?? "").split(" ").slice(1).join(" ") ?? "";
      const expiresAt = account.expires_at ? new Date(account.expires_at * 1000) : undefined;
      try {
        const result = await handleSocialSignIn({
          email: user.email ?? null,
          firstName, lastName, providerId, provider,
          accessToken: account.access_token,
          scopes: account.scope,
          expiresAt,
        });
        (account as any)._appTokens = result.appTokens;
        (account as any)._appUserId = result.appUserId;
        (account as any)._appUserRole = result.appUserRole;
        (account as any)._isNewUser = result.isNewUser;
        (account as any)._userData = result.userData;
      } catch (err) {
        console.error("NextAuth signIn error:", err);
        return false;
      }
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
        token.appAccessToken = (account as any)._appTokens?.accessToken;
        token.appRefreshToken = (account as any)._appTokens?.refreshToken;
        token.appUserId = (account as any)._appUserId;
        token.appUserRole = (account as any)._appUserRole;
        token.isNewUser = (account as any)._isNewUser;
        token.userData = (account as any)._userData;
      }
      return token;
    },

    async session({ session, token }) {
      session.provider = token.provider as string;
      session.appAccessToken = token.appAccessToken as string;
      session.appRefreshToken = token.appRefreshToken as string;
      session.appUserId = token.appUserId as string;
      session.appUserRole = token.appUserRole as string;
      session.isNewUser = token.isNewUser as boolean;
      session.userData = token.userData as object;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

declare module "next-auth" {
  interface Session {
    provider?: string;
    appAccessToken?: string;
    appRefreshToken?: string;
    appUserId?: string;
    appUserRole?: string;
    isNewUser?: boolean;
    userData?: object;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
    appAccessToken?: string;
    appRefreshToken?: string;
    appUserId?: string;
    appUserRole?: string;
    isNewUser?: boolean;
    userData?: object;
  }
}