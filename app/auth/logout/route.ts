import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { USER_ROLE_COOKIE_NAME } from '@/app/dashboard/mock-api';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirect = url.searchParams.get('redirect') ?? '/login';
  (await cookies()).delete(USER_ROLE_COOKIE_NAME);
  return NextResponse.redirect(redirect);
}
