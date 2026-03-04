'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import { SidebarIcon } from 'lucide-react';

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserName() {
      try {
        const response = await fetch('/api/user-name');
        if (response.ok) {
          const data = await response.json();
          setUserName(data.name);
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserName();
  }, []);

  return (
    <header className='bg-sidebar text-sidebar-foreground sticky top-0 z-50 flex w-full items-center border-b'>
      <div className='flex h-(--header-height) w-full items-center gap-2 px-4'>
        <Button className='h-8 w-8' variant='ghost' size='icon' onClick={toggleSidebar}>
          <SidebarIcon />
        </Button>
        <Separator orientation='vertical' className='mr-2 h-4' />
        {!isLoading && userName && <span className='ml-auto text-sm font-medium'>Welcome, {userName}</span>}
      </div>
    </header>
  );
}
