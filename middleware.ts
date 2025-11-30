import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  try {
    const { pathname } = req.nextUrl;
    const isAuthenticated = !!req.auth;

    // Protect /search route
    if (pathname.startsWith('/search') && !isAuthenticated) {
      const signInUrl = new URL('/auth', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

