import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DashboardTablePageSkeletonProps {
  titleWidth?: string;
  descriptionWidth?: string;
  showBadge?: boolean;
  headerAction?: ReactNode;
  toolbar?: ReactNode;
  columnCount?: number;
  rowCount?: number;
}

export function DashboardTablePageSkeleton({
  titleWidth = 'w-40',
  descriptionWidth = 'w-40',
  showBadge = true,
  headerAction,
  toolbar,
  columnCount = 5,
  rowCount = 5,
}: DashboardTablePageSkeletonProps) {
  return (
    <main className='p-2 md:p-8'>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <div className='flex items-center gap-2'>
              <Skeleton className={`h-9 ${titleWidth}`} />
              {showBadge && <Skeleton className='h-6 w-10 rounded-full' />}
            </div>
            <Skeleton className={`mt-2 h-4 ${descriptionWidth}`} />
          </div>
          {headerAction}
        </div>

        <Card className='overflow-hidden border border-zinc-300'>
          <CardHeader className='border-b px-4 py-4'>
            <div className='flex items-center gap-3 sm:justify-end'>
              {toolbar}
              <Skeleton className='h-10 w-full sm:max-w-sm' />
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  {Array.from({ length: columnCount }).map((_, index) => (
                    <TableHead
                      key={index}
                      className='border border-b-zinc-400 bg-stone-300 px-4 py-2 text-left font-semibold tracking-wider'
                    >
                      <Skeleton className='h-4 w-20' />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: rowCount }).map((_, rowIndex) => (
                  <TableRow key={rowIndex} className='bg-sidebar'>
                    {Array.from({ length: columnCount }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className={cellIndex === columnCount - 1 ? 'h-9 w-24 rounded-full' : 'h-5 w-full'} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
