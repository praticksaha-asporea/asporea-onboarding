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

  let socialRecord = await SocialLogins.findOne({ type: provider, providerId });
  let dbUser: any;
  let tokens;

  if (socialRecord) {
    dbUser = await User.findById(socialRecord.userId);
    if (dbUser) dbUser = { ...dbUser.toObject(), registered: 1 };
  } else if (email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      dbUser = { ...existingUser.toObject(), registered: 1 };
    } else {
      dbUser = { _id: null, email, firstName, lastName, type: provider, providerId, accessToken, scopes, expiresAt, registered: 0 };
    }
  } else {
    dbUser = { _id: null, email: null, firstName, lastName, type: provider, providerId, accessToken, scopes, expiresAt, registered: 0 };
  }

  if (dbUser?._id != null) {
    if (socialRecord) {
      await SocialLogins.findByIdAndUpdate(socialRecord._id, { accessToken, scopes, expiresAt });
    }
    tokens = await generateTokens({
      _id: String(dbUser._id),
      role: String(dbUser.role ?? "user"),
    });
  }

  return {
    appTokens: tokens,
    appUserId: String(dbUser?._id),
    appUserRole: String(dbUser?.role ?? "user"),
    isNewUser: dbUser?.registered === 0,
    userData: dbUser,
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
        (account as any)._userData = result.userData;
      } catch (err) {
        console.error("NextAuth signIn error:", err);
        return false;
      }
      return true;
    },

    async redirect({ url, baseUrl }) {
      // After OAuth callback, route through our cookie-setter before going to the app
      if (url.includes("/api/auth/callback/")) {
        return `${baseUrl}/api/auth/social-callback`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },

    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
        token.appAccessToken = (account as any)._appTokens?.accessToken;
        token.appRefreshToken = (account as any)._appTokens?.refreshToken;
        token.appUserId = (account as any)._appUserId;
        token.appUserRole = (account as any)._appUserRole;
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
    userData?: object;
  }
}