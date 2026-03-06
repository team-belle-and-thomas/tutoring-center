'use server';

import { getParentDashboardData, type DateRange, type StudentProgressData } from '@/lib/data/dashboard';

export async function fetchParentDashboardData(
  dateRange?: DateRange,
  subject?: string,
  studentId?: number
): Promise<{
  students: StudentProgressData[];
  defaultStudentId: number | null;
}> {
  return getParentDashboardData(dateRange, subject, studentId);
}
