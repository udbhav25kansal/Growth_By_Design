import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import { UserService } from '@/backend/services/userService';

const TOKEN_NAME = 'auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(TOKEN_NAME)?.value;

  let isTokenValid = false;
  if (token) {
    try {
      const secret = process.env.JWT_SECRET ?? 'dev_secret_key';
      const secretKey = new TextEncoder().encode(secret);
      const { payload } = await jose.jwtVerify(token, secretKey) as { payload: { id: number } };

      // Extra safeguard: confirm the referenced user still exists in DB
      const user = await UserService.getUserById(payload.id);
      if (user) {
        isTokenValid = true;
      }
    } catch (err) {
      // Either verification failed or the user no longer exists
    }
  }

  // Logged-in user behavior
  if (isTokenValid) {
    if (pathname === '/login' || pathname === '/signup') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Logged-out user behavior - redirect to login
  if (!isTokenValid) {
    // Redirect root to login
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    const isPublicPage = ['/login', '/signup'].includes(pathname);

    if (isPublicPage) {
      return NextResponse.next();
    }
    
    // All other pages require authentication
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: 'nodejs',
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 