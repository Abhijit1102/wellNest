import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  // 1. Ignore assets
  if (pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/) || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  const isAuthPage = pathname.startsWith('/auth');

  if (token) {
    try {
      const verifyRes = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store', // Always check fresh
      });

      // 2. If Token is invalid OR User was deleted (FastAPI 401)
      if (verifyRes.status === 401) {
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete('auth_token');
        return response;
      }

      // 3. Valid token? Don't allow access to /auth/login
      if (isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (err) {
      console.error("Proxy check failed: Backend offline");
    }
  } else {
    // 4. No token? Force login for all non-auth pages
    if (!isAuthPage) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};