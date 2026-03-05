import { notFound, redirect, unauthorized } from 'next/navigation';
// Import auth functions from auth.ts (Single Source of Truth)
import { getCurrentUserID, getUserRole } from '@/lib/auth';
import { allParents, allReports, allStudents, allTutors } from '@/lib/mock-data';

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
    unauthorized();
  }
  const students = new Set(allStudents.filter(student => student.parent_id === parent.id).map(s => s.id));

  if (!students.has(report.student_id)) {
    unauthorized();
  }
  return report;
}

export async function getTutors() {
  const role = await getUserRole();
  if (role !== 'admin') {
    redirect('/dashboard');
  }
  return allTutors;
}

export async function getTutor(id: number) {
  const tutor = allTutors.find(tutor => tutor.user_id == id);

  if (!tutor) {
    notFound();
  }

  return tutor;
}
