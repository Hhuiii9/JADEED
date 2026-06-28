import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "jadeed_coconut_oil_secure_jwt_secret_token_2026_06_28";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

async function verifyToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string };
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("jadeed_session")?.value;

  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isOfflineRoute = pathname === "/offline";
  const isRoot = pathname === "/";

  // Bypass checks for the offline fallback page
  if (isOfflineRoute) {
    return NextResponse.next();
  }

  let user = null;
  if (sessionToken) {
    user = await verifyToken(sessionToken);
  }

  // If user is accessing dashboard but not logged in -> redirect to login
  if (isDashboardRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    // Keep track of redirect URL
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is accessing login/signup but is already logged in -> redirect to dashboard
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is accessing root, redirect to dashboard if logged in, else login
  if (isRoot) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",
  ],
};
