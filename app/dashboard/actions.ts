'use server';

import { getParentDashboardData, type DateRange, type StudentProgressData } from '@/lib/data/dashboard';

export async function fetchParentDashboardData(dateRange?: DateRange): Promise<{
  students: StudentProgressData[];
  defaultStudentId: number | null;
}> {
  return getParentDashboardData(dateRange);
}
