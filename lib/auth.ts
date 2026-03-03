import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export type UserRole = 'admin' | 'parent' | 'tutor';

export const USER_ROLE_COOKIE_NAME = 'user-role';

export const ADMIN_ONLY_ROUTES = ['/dashboard/tutors', '/dashboard/parents'];

export function isValidRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'parent' || value === 'tutor';
}

export async function getUserRole() {
  const cookieStore = await cookies();
  const role = cookieStore.get(USER_ROLE_COOKIE_NAME)?.value;
  if (!isValidRole(role)) {
    redirect('/login?redirect=/auth/logout');
  }
  return role;
}

export function middleware(request: NextRequest) {
  const userRole = request.cookies.get(USER_ROLE_COOKIE_NAME)?.value;
  const pathname = request.nextUrl.pathname;

  if (ADMIN_ONLY_ROUTES.includes(pathname) && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
