import { DashboardTablePageSkeleton } from '@/components/dashboard-table-page-skeleton';

export default function StudentsLoading() {
  return <DashboardTablePageSkeleton titleWidth='w-36' descriptionWidth='w-40' columnCount={4} />;
}
