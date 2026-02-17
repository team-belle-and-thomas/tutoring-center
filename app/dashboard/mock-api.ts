import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Route } from 'next';

export interface SidebarLink {
  id: number;
  href: Route;
  text: string;
}

type UserRole = 'admin' | 'parent';

export function getUserLinks(role: UserRole) {
  switch (role) {
    case 'admin':
      return adminLinks;
    case 'parent':
      return parentLinks;
    default:
      throw new Error('Invalid user role');
  }
}

const adminLinks: SidebarLink[] = [
  { id: 1, href: '/dashboard', text: 'Dashboard' },
  { id: 2, href: '/dashboard/tutors', text: 'Tutors' },
  { id: 3, href: '/dashboard/parents', text: 'Parents' },
  { id: 4, href: '/dashboard/students', text: 'Students' },
  { id: 5, href: '/dashboard/sessions', text: 'Sessions' },
  {
    id: 6,
    href: '/dashboard/credit-transactions',
    text: 'Credit Transactions',
  },
  { id: 7, href: '/dashboard/progress-reports', text: 'Progress Reports' },
];

const parentLinks: SidebarLink[] = [
  { id: 1, href: '/dashboard', text: 'Dashboard' },
  { id: 2, href: '/dashboard/students', text: 'Students' },
  { id: 3, href: '/dashboard/sessions', text: 'Sessions' },
  {
    id: 4,
    href: '/dashboard/credit-transactions',
    text: 'Credit Transactions',
  },
  { id: 5, href: '/dashboard/progress-reports', text: 'Progress Reports' },
];

export const USER_ROLE_COOKIE_NAME = 'user-role';
const USER_ROLE_COOKIE_MAX_AGE = 60 * 60 * 1; // 1 hour

function isUserRole(value: unknown) {
  return value === 'admin' || value === 'parent';
}

export async function getUserRole() {
  const cookieStore = await cookies();
  const role = cookieStore.get(USER_ROLE_COOKIE_NAME)?.value;
  if (!isUserRole(role)) {
    cookieStore.delete(USER_ROLE_COOKIE_NAME);
    redirect('/login');
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
