import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import LinkedInProvider from "next-auth/providers/linkedin";
import {
  handleSocialSignInService,
  SocialProvider,
} from "@/lib/services/auth/social-login.service";

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
      jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
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
      const firstName =
        (profile as any)?.given_name ??
        (profile as any)?.first_name ??
        (user.name ?? "").split(" ")[0] ??
        "";
      const lastName =
        (profile as any)?.family_name ??
        (profile as any)?.last_name ??
        (user.name ?? "").split(" ").slice(1).join(" ") ??
        "";
      const expiresAt = account.expires_at
        ? new Date(account.expires_at * 1000)
        : undefined;
      try {
        const result = await handleSocialSignInService({
          email: user.email ?? null,
          firstName,
          lastName,
          providerId,
          provider,
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
