import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const { pathname } = request.nextUrl;

  console.log(`[Middleware] Path: ${pathname}, Token exists: ${!!token}`);

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);
  
  // Protected paths that require authentication
  const protectedPaths = ['/profile'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  console.log(`[Middleware] isPublicPath: ${isPublicPath}, isProtectedPath: ${isProtectedPath}`);

  // If user is not authenticated and tries to access a protected route, redirect to /login
  if (!token && isProtectedPath) {
    console.log(`[Middleware] Redirecting unauthenticated user from ${pathname} to /login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and tries to access a public route (login/register), redirect to home
  if (token && isPublicPath) {
    console.log(`[Middleware] Redirecting authenticated user from ${pathname} to /`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Handle the specific case for authenticated users accessing /profile
  if (token && isProtectedPath) {
    console.log(`[Middleware] Allowing authenticated user to access ${pathname}`);
    return NextResponse.next();
  }

  // Otherwise, allow the request
  console.log(`[Middleware] Default case: allowing access to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
