import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { protectedRoutesCandidate, protectedRouteTAC } from './Routes/protected.routes';
import { authRoutes } from './Routes/auth.routes';
import { decodedToken } from './lib/middleware/auth.middleware';
import { JwtPayload } from 'jsonwebtoken';

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;
  const origin = req.headers.get('origin');
  const response = NextResponse.next();
  // console.log(response, 99999999);

  // ── Always pass through NextAuth routes and all /api/* paths ─────────────
  if (pathname.startsWith('/api/')) {
    return response;
  }

  if (!origin) {
    const normalizedPath = pathname.replace(/^\/+/, '');

    const accessToken = req.cookies.get('accessToken')?.value || null;
    const refreshToken = req.cookies.get('refreshToken')?.value || null;

    // Also treat a valid NextAuth session as logged in (social login flow)
    const nextAuthSession =
      req.cookies.get('next-auth.session-token')?.value ||
      req.cookies.get('__Secure-next-auth.session-token')?.value ||
      null;

    const userDataRaw = decodedToken(accessToken as string) as JwtPayload;
    const isLoggedIn = !!(accessToken && refreshToken) || !!nextAuthSession;
    const userData = userDataRaw ? userDataRaw : null;
    const role = userData?.role || null;

    // 1️⃣ Not logged in
    if (!isLoggedIn) {
      const isProtected =
        protectedRoutesCandidate.includes(normalizedPath) ||
        protectedRouteTAC.includes(normalizedPath);

      if (isProtected) {
        return NextResponse.redirect(new URL('/', req.url));
      }

      return response;
    }

    // 2️⃣ Logged in — redirect away from auth pages
    if (authRoutes.includes(normalizedPath)) {
      return NextResponse.redirect(
        new URL(
          role === 'user' || nextAuthSession ? '/inquiry' : '/dashboard',
          req.url,
        ),
      );
    }

    // 3️⃣ Role-based route checks (only for JWT-authenticated users, not NextAuth sessions)
    if (role === 'user') {
      if (!protectedRoutesCandidate.includes(normalizedPath)) {
        return NextResponse.redirect(new URL('/inquiry', req.url));
      }
    }

    if (role === 'tac') {
      if (!protectedRouteTAC.includes(normalizedPath)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  } else {
    // Handle preflight requests (OPTIONS)
    if (req.method === 'OPTIONS') {
      const response = new Response(null, { status: 204 });
      response.headers.set('Access-Control-Allow-Origin', origin || '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, access, refresh, resource');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, access, refresh, resource');
  }

  return response;
}

export const config = {
  matcher: [`/((?!.next|fonts|examples|assets|[\\w-]+\\.\\w+).*)`],
};
