import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { protectedRoutesCandidate, protectedRouteTAC } from './Routes/protected.routes';
import { authRoutes, publicRoutes } from './Routes/auth.routes';
import { decodedToken } from './lib/middleware/auth.middleware';
import { JwtPayload } from 'jsonwebtoken';

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;
  const origin = req.headers.get('origin');
  const response = NextResponse.next();
  
  if (!origin && req.url.includes('/api')) {
    return response;
  }
  if (!origin) {
    const normalizedPath = pathname.replace(/^\/+/, '');

    // Always allow public routes through — no auth checks
    if (publicRoutes.some((r) => normalizedPath === r || normalizedPath.startsWith(r + '/'))) {
      return response;
    }

    const accessToken = req.cookies.get('accessToken')?.value || null;
    const refreshToken = req.cookies.get('refreshToken')?.value || null;
    const userDataRaw = decodedToken(accessToken as string) as JwtPayload;

    const isLoggedIn = !!(accessToken && refreshToken);
    const userData = userDataRaw ? userDataRaw : null;
    const role = userData?.role || null;


    // -----------------------
    // 1️⃣ If user is NOT logged in
    // -----------------------
    if (!isLoggedIn) {
      
      const isProtected =
        protectedRoutesCandidate.some((r) => normalizedPath === r || normalizedPath.startsWith(r + '/')) ||
        protectedRouteTAC.some((r) => normalizedPath === r || normalizedPath.startsWith(r + '/'));

    // console.log('non',protectedRouteTAC,normalizedPath, 22222);
      if (isProtected) {
        // Redirect to login if trying to access protected route
        return NextResponse.redirect(new URL('/', req.url));
      }

      return response; // Can access public routes
    }

    // -----------------------
    // 2️⃣ If user IS logged in
    // -----------------------

    // 🔹 Redirect away from auth pages to dashboard
    if (authRoutes.includes(normalizedPath)) {
      return NextResponse.redirect(
        new URL(
          role === 'user' ? '/inquiry' : '/dashboard',
          req.url,
        ),
      );
    }

    // 🔹 Role-based route checks
    if (role === 'user') {
      // If trying to access a path not in learner routes → redirect
      if (!protectedRoutesCandidate.includes(normalizedPath)) {
        return NextResponse.redirect(new URL('/inquiry', req.url));
      }
    }

    if (role === 'tac') {
      // If trying to access a path not in TAC routes → redirect
      const isTacRoute = protectedRouteTAC.some(
        (r) => normalizedPath === r || normalizedPath.startsWith(r + '/')
      );
      if (!isTacRoute) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  } else {
    // Handle preflight requests (OPTIONS)
    if (req.method === 'OPTIONS') {
      const response = new Response(null, { status: 204 });
      response.headers.set('Access-Control-Allow-Origin', origin || '*');
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, access, refresh, resource',
      );
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }
    // console.log(origin);
    // Handle actual requests
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, access, refresh, resource',
    );
  }
  return response;
}

// ✅ Apply to all routes except API and static files
export const config = {
  matcher: [`/((?!.next|fonts|examples|assets|uploads|[\\w-]+\\.\\w+).*)`],
};
