import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get('auth_token')?.value;

  // Paths that are publicly accessible
  const isAuthPath = request.nextUrl.pathname.startsWith('/auth');

  if (!token && !isAuthPath) {
    // If user is not logged in and trying to access a secure route
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (token && isAuthPath) {
    // If user is already logged in, redirect them away from auth pages
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Images and other static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
