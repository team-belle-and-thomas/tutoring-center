'use client';

import Link from 'next/link';
import { DataTable, DataTableFilter, DataTableToolbar } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@/lib/auth';
import type { CreditTransactionRow } from '@/lib/data/credit-transactions';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary';

function getTypeBadgeVariant(type: string): BadgeVariant {
  switch (type) {
    case 'Purchase':
      return 'default';
    case 'Session Debit':
      return 'destructive';
    case 'Refund':
      return 'outline';
    case 'Adjustment':
      return 'secondary';
    case 'Cancellation Fee':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function getColumns(role: UserRole): ColumnDef<CreditTransactionRow>[] {
  const columns: ColumnDef<CreditTransactionRow>[] = [
    {
      id: 'date',
      accessorKey: 'created_at',
      header: () => <div>Date</div>,
      cell: ({ row }) => <div>{format(new Date(row.original.created_at), 'MMM d, yyyy')}</div>,
    },
    {
      id: 'name',
      accessorKey: 'student_name',
      header: () => <div>Student</div>,
      cell: ({ row }) => <div>{row.original.student_name}</div>,
    },
    {
      id: 'type',
      accessorKey: 'type',
      header: () => <div>Type</div>,
      cell: ({ row }) => <Badge variant={getTypeBadgeVariant(row.original.type)}>{row.original.type}</Badge>,
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: () => <div>Amount</div>,
      cell: ({ row }) => {
        const amount = row.original.amount;
        const isPositive = amount >= 0;
        return (
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {isPositive ? `+${amount}` : `${amount}`}
          </span>
        );
      },
    },
    {
      id: 'balance_after',
      accessorKey: 'balance_after',
      header: () => <div>Balance After</div>,
      cell: ({ row }) => <div>{row.original.balance_after}</div>,
    },
    {
      id: 'actions',
      header: () => <div>Actions</div>,
      cell: ({ row }) => (
        <Button asChild variant='default' size='sm'>
          <Link href={`/dashboard/credit-transactions/${row.original.id}`}>Details</Link>
        </Button>
      ),
    },
  ];

  if (role === 'admin') {
    columns.splice(1, 0, {
      id: 'parent',
      accessorKey: 'parent_name',
      header: () => <div>Parent</div>,
      cell: ({ row }) => <div>{row.original.parent_name}</div>,
    });
  }

  return columns;
}

export function CreditTransactionsTable({ role, data }: { role: UserRole; data: CreditTransactionRow[] }) {
  return (
    <DataTable columns={getColumns(role)} data={data}>
      <DataTableToolbar>
        <DataTableFilter
          columnId='type'
          label='Filter by type'
          options={['Purchase', 'Session Debit', 'Refund', 'Adjustment', 'Cancellation Fee']}
        />
      </DataTableToolbar>
    </DataTable>
  );
}
