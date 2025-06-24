import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const TOKEN_NAME = 'auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(TOKEN_NAME)?.value;

  let isTokenValid = false;
  if (token) {
    try {
      const secret = process.env.JWT_SECRET ?? 'dev_secret_key';
      const secretKey = new TextEncoder().encode(secret);
      await jose.jwtVerify(token, secretKey);
      isTokenValid = true;
    } catch (err) {
      // Token verification failed
    }
  }

  // Logged-in user behavior
  if (isTokenValid) {
    if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Logged-out user behavior
  if (!isTokenValid) {
    const isPublicPage = ['/login', '/signup', '/get-started'].includes(pathname);
    const isPublicApi = pathname.startsWith('/api/auth');

    if (isPublicPage || isPublicApi) {
      return NextResponse.next();
    }
    
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/signup', '/get-started', '/dashboard', '/dashboard/:path*', '/api/documents/:path*'],
}; 