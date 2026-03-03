import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_ONLY_ROUTES = ['/dashboard/tutors', '/dashboard/parents'];

export function middleware(request: NextRequest) {
  const userRole = request.cookies.get('user-role')?.value;

  const pathname = request.nextUrl.pathname;

  if (ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route)) && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
