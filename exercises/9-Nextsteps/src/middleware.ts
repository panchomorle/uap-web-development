import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);

  // If user is not authenticated and tries to access a protected route, redirect to /login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and tries to access a public route, redirect to home
  if (token && isPublicPath) {
    console.log("tried to access: ", pathname);
    console.log(publicPaths);
    console.log(isPublicPath);
    console.log('tried to access login/register while logged in');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Otherwise, allow the request
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
