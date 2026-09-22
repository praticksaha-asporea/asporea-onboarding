import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  protectedRoutesCandidate,
  protectedRouteTAC,
  protectedRouteTACHead,
} from "./Routes/protected.routes";
import { authRoutes, publicRoutes } from "./Routes/auth.routes";
import { decodedToken } from "./lib/middleware/auth.middleware";
import { JwtPayload } from "jsonwebtoken";

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;
  const origin = req.headers.get("origin");
  const response = NextResponse.next();

  if (!origin && req.url.includes("/api")) {
    return response;
  }

  if (!origin) {
    const normalizedPath = pathname.replace(/^\/+/, "");

    // 1️⃣ Always allow public routes
    if (
      publicRoutes.some(
        (r) => normalizedPath === r || normalizedPath.startsWith(r + "/"),
      )
    ) {
      return response;
    }

    const accessToken = req.cookies.get("accessToken")?.value || null;
    const refreshToken = req.cookies.get("refreshToken")?.value || null;
    const userDataRaw = accessToken
      ? (decodedToken(accessToken as string) as JwtPayload)
      : null;

    const isLoggedIn = !!(accessToken && refreshToken);
    const role = userDataRaw?.role || null;

    const roleConfig: Record<
      string,
      { allowedRoutes: string[]; defaultRedirect: string }
    > = {
      user: {
        allowedRoutes: protectedRoutesCandidate,
        defaultRedirect: "/inquiry",
      },
      tac: { allowedRoutes: protectedRouteTAC, defaultRedirect: "/dashboard" },
      foe: { allowedRoutes: protectedRouteTAC, defaultRedirect: "/dashboard" },
      tac_head: {
        allowedRoutes: protectedRouteTACHead,
        defaultRedirect: "/tac-head/dashboard",
      },
    };

    const allKnownProtectedRoutes = Object.values(roleConfig).flatMap(
      (config) => config.allowedRoutes,
    );

    const isValidKnownRoute = allKnownProtectedRoutes.some(
      (r) => normalizedPath === r || normalizedPath.startsWith(r + "/"),
    );

    // -----------------------
    // 2️⃣ If user is NOT logged in
    // -----------------------
    if (!isLoggedIn) {
      if (isValidKnownRoute) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return response;
    }

    // -----------------------
    // 3️⃣ If user IS logged in
    // -----------------------

    if (
      !isValidKnownRoute &&
      !authRoutes.includes(normalizedPath) &&
      normalizedPath !== ""
    ) {
      return response;
    }

    if (role && roleConfig[role]) {
      const currentRoleData = roleConfig[role];

      if (authRoutes.includes(normalizedPath)) {
        return NextResponse.redirect(
          new URL(currentRoleData.defaultRedirect, req.url),
        );
      }

      const isAllowedForRole = currentRoleData.allowedRoutes.some(
        (r) => normalizedPath === r || normalizedPath.startsWith(r + "/"),
      );

      if (!isAllowedForRole) {
        return NextResponse.redirect(
          new URL(currentRoleData.defaultRedirect, req.url),
        );
      }
    }
  } else {
    // Handle preflight requests (OPTIONS)
    if (req.method === "OPTIONS") {
      const response = new Response(null, { status: 204 });
      response.headers.set("Access-Control-Allow-Origin", origin || "*");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS, PATCH",
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, access, refresh, resource",
      );
      response.headers.set("Access-Control-Allow-Credentials", "true");
      return response;
    }

    // Handle actual requests
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, access, refresh, resource",
    );
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads|images|assets|fonts).*)",
  ],
};
