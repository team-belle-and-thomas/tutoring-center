import { notFound } from 'next/navigation';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getParent } from '@/lib/mock-api';
import { columns } from './columns';

export default async function SingleParentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (Number.isNaN(Number(id))) {
    notFound();
  }
  const parent = await getParent(Number(id));
  return (
    <main className='p-2 md:p-8 space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle className='font-semibold'>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-1'>
            <p className='text-muted-foreground text-sm'>Name</p>
            <p className='text-sm'>
              {parent.first_name} {parent.last_name}
            </p>
          </div>
          <Separator />
          <div className='space-y-1'>
            <p className='text-muted-foreground text-sm'>Email</p>
            <p className='text-sm'>{parent.email}</p>
          </div>
          <Separator />
          <div className='space-y-1'>
            <p className='text-muted-foreground text-sm'>Phone</p>
            <p className='text-sm'>{parent.phone}</p>
          </div>
          <Separator />
          <div className='space-y-1'>
            <p className='text-muted-foreground text-sm'>Billing</p>
            <p className='text-sm'>{parent.billing_address}</p>
          </div>
          <Separator />
          <div className='space-y-2'>
            <p className='text-muted-foreground text-sm'>Notification Preferences</p>
            <Badge>{parent.notification_preferences}</Badge>
          </div>
        </CardContent>
      </Card>
      <DataTable columns={columns} data={parent.students} />
    </main>
  );
}
