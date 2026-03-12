import { DashboardTablePageSkeleton } from '@/components/dashboard-table-page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function CreditTransactionsLoading() {
  return (
    <DashboardTablePageSkeleton
      titleWidth='w-64'
      descriptionWidth='w-44'
      showBadge={false}
      toolbar={<Skeleton className='mr-2 h-10 w-36 rounded-xl' />}
      columnCount={6}
    />
  );
}
