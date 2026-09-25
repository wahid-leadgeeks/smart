import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const SMART_SESSION_COOKIE = 'smart_session';

// Public endpoints and pages that do not require authentication
const PUBLIC_PREFIXES = [
  '/login',
  '/api/auth',
  '/api/health',
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Allow static assets, images, and Next.js internal files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    /\.(ico|png|jpg|jpeg|svg|webp|css|js|map)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Check if the path is explicitly public
  const isPublic = PUBLIC_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const hasSession = request.cookies.has(SMART_SESSION_COOKIE);

  // If already logged in and visiting /login, redirect to destination or home
  if (pathname === '/login' && hasSession) {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const safeDestination =
      redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
        ? redirectParam
        : '/';
    return NextResponse.redirect(new URL(safeDestination, request.url));
  }

  // If visiting a public route, allow it through
  if (isPublic) {
    return NextResponse.next();
  }

  // 3. Protected route: verify session cookie exists
  if (!hasSession) {
    // API routes return 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please sign in with Google.',
          loginUrl: '/login',
        },
        { status: 401 }
      );
    }

    // Page routes redirect to /login with redirect query param
    const loginUrl = new URL('/login', request.url);
    const returnDestination = `${pathname}${search}`;
    if (returnDestination && returnDestination !== '/') {
      loginUrl.searchParams.set('redirect', returnDestination);
    }

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
