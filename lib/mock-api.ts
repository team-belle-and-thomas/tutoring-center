import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { parents } from '@/lib/mock-data';

export type UserRole = 'admin' | 'parent';

export const USER_ROLE_COOKIE_NAME = 'user-role';
const USER_ROLE_COOKIE_MAX_AGE = 60 * 60 * 1; // 1 hour

export async function getParents() {
  const role = await getUserRole();
  if (role !== 'admin') {
    notFound();
  }
  return parents;
}

function isUserRole(value: unknown) {
  return value === 'admin' || value === 'parent';
}

export async function getUserRole() {
  const cookieStore = await cookies();
  const role = cookieStore.get(USER_ROLE_COOKIE_NAME)?.value;
  if (!isUserRole(role)) {
    redirect('/login?redirect=/auth/logout');
  }

  return role;
}

export async function login(formData: FormData) {
  'use server';

  const role = formData.get('role');
  if (!isUserRole(role)) {
    throw new Error('Invalid role');
  }

  const cookieStore = await cookies();
  cookieStore.set(USER_ROLE_COOKIE_NAME, role, {
    httpOnly: true,
    maxAge: USER_ROLE_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  redirect('/dashboard');
}
