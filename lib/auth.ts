import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';

export type UserRole = 'admin' | 'parent' | 'tutor';

export const USER_ROLE_COOKIE_NAME = 'user-role';
export const USER_ID_COOKIE_NAME = 'user-id';
const USER_ROLE_COOKIE_MAX_AGE = 60 * 60 * 1; // 1 hour
const USER_ID_COOKIE_MAX_AGE = 60 * 60 * 1; // 1 hour

export const ADMIN_ONLY_ROUTES = ['/dashboard/tutors', '/dashboard/parents'];

export function isValidRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'parent' || value === 'tutor';
}

export function isUserRole(value: unknown): value is UserRole {
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

export async function getCurrentUserID() {
  const cookieStore = await cookies();
  const id = cookieStore.get(USER_ID_COOKIE_NAME)?.value;
  if (!id) {
    redirect('/login?redirect=/auth/logout');
  }

  return parseInt(id, 10);
}

/**
 * Get a real user ID from Supabase based on the selected role.
 * Returns the first user with the specified role, sorted by user ID for determinism.
 */
export async function getUserIdByRole(role: UserRole): Promise<string | null> {
  const supabase = createSupabaseServiceClient();

  if (role === 'parent') {
    const { data, error } = await supabase
      .from('parents')
      .select('user_id')
      .order('user_id', { ascending: true })
      .limit(1);

    if (error) {
      console.error('Error fetching parent user:', error);
      return null;
    }
    return data?.[0]?.user_id?.toString() ?? null;
  }

  if (role === 'tutor') {
    const { data, error } = await supabase
      .from('tutors')
      .select('user_id')
      .order('user_id', { ascending: true })
      .limit(1);

    if (error) {
      console.error('Error fetching tutor user:', error);
      return null;
    }
    return data?.[0]?.user_id?.toString() ?? null;
  }

  if (role === 'admin') {
    // First get the admin role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .ilike('name', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error('Error fetching admin role:', roleError);
      return null;
    }

    // Then get the first user with that role
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('role', roleData.id)
      .order('id', { ascending: true })
      .limit(1);

    if (error) {
      console.error('Error fetching admin user:', error);
      return null;
    }
    return data?.[0]?.id?.toString() ?? null;
  }

  return null;
}

/**
 * Get the current user's name from Supabase
 */
export async function getCurrentUserName(): Promise<string | null> {
  const userId = await getCurrentUserID();
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase.from('users').select('first_name, last_name').eq('id', userId).single();

  if (error) {
    console.error('Error fetching user name:', error);
    return null;
  }

  if (data) {
    return `${data.first_name} ${data.last_name}`;
  }

  return null;
}

export async function login(formData: FormData) {
  'use server';

  const role = formData.get('role');
  if (!isUserRole(role)) {
    throw new Error('Invalid role');
  }

  // Get real user ID from Supabase based on role
  const userId = await getUserIdByRole(role);

  // Fallback to temp user if no user found for role
  let finalUserId = userId;
  if (!finalUserId) {
    console.warn(`No user found for role '${role}', using fallback user ID`);
    finalUserId = '2'; // Fallback temp user
  }

  const cookieStore = await cookies();
  cookieStore.set(USER_ROLE_COOKIE_NAME, role, {
    httpOnly: true,
    maxAge: USER_ROLE_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  cookieStore.set(USER_ID_COOKIE_NAME, finalUserId, {
    httpOnly: true,
    maxAge: USER_ID_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  redirect('/dashboard');
}

export function middleware(request: NextRequest) {
  const userRole = request.cookies.get(USER_ROLE_COOKIE_NAME)?.value;
  const pathname = request.nextUrl.pathname;

  if (ADMIN_ONLY_ROUTES.includes(pathname) && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
