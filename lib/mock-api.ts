import { cookies } from 'next/headers';
import { notFound, redirect, unauthorized } from 'next/navigation';
import { allParents, allReports, allStudents, allTutors } from '@/lib/mock-data';

export type UserRole = 'admin' | 'parent';

export const USER_ROLE_COOKIE_NAME = 'user-role';
export const USER_ID_COOKIE_NAME = 'user-id';
const USER_ROLE_COOKIE_MAX_AGE = 60 * 60 * 1; // 1 hour
const USER_ID_COOKIE_MAX_AGE = 60 * 60 * 1; // 1 hour

export async function getParents() {
  const role = await getUserRole();
  if (role !== 'admin') {
    notFound();
  }
  return allParents;
}

export async function getParent(id: number) {
  const role = await getUserRole();
  if (role !== 'admin') {
    notFound();
  }
  const parent = allParents.find(parent => parent.user_id === id);
  if (!parent) {
    notFound();
  }
  const students = allStudents.filter(student => student.parent_id === parent.id);
  return { ...parent, students };
}

export async function getReports() {
  const role = await getUserRole();
  if (role === 'admin') {
    return allReports;
  }
  const userID = await getCurrentUserID();
  const parent = allParents.find(parent => parent.user_id === userID);
  if (!parent) {
    notFound();
  }
  const students = new Set(allStudents.filter(student => student.parent_id === parent.id).map(s => s.id));

  const reports = allReports.filter(report => students.has(report.student_id));

  return reports;
}

export async function getReport(id: number) {
  const role = await getUserRole();
  const report = allReports.find(report => report.id === id);
  if (!report) {
    return notFound();
  }
  if (role === 'admin') {
    return report;
  }
  const userID = await getCurrentUserID();
  const parent = allParents.find(parent => parent.user_id === userID);
  if (!parent) {
    return unauthorized();
  }
  const students = new Set(allStudents.filter(student => student.parent_id === parent.id).map(s => s.id));

  if (!students.has(report.student_id)) {
    return unauthorized();
  }
  return report;
}
export async function getTutors() {
  const role = await getUserRole();
  if (role !== 'admin') {
    notFound();
  }
  return allTutors;
}

export async function getTutor(id: number) {
  const tutor = allTutors.find(tutor => tutor.user_id == id);
  return tutor;
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

export async function getCurrentUserID() {
  const cookieStore = await cookies();
  const id = cookieStore.get(USER_ID_COOKIE_NAME)?.value;
  if (!id) {
    redirect('/login?redirect=/auth/logout');
  }

  return parseInt(id, 10);
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
  // For now use a temp user but in production get actual userid
  const TEMP_USER = '101';
  cookieStore.set(USER_ID_COOKIE_NAME, TEMP_USER, {
    httpOnly: true,
    maxAge: USER_ID_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  redirect('/dashboard');
}
