'use client';

import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import { SidebarIcon } from 'lucide-react';

const playfair = Playfair_Display({ style: 'italic', subsets: ['latin'] });

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className='bg-sidebar text-sidebar-foreground sticky top-0 z-50 flex w-full items-center border-b'>
      <div className='flex h-(--header-height) w-full items-center gap-3 px-4'>
        <Button className='h-8 w-8' variant='ghost' size='icon' onClick={toggleSidebar}>
          <SidebarIcon />
        </Button>
        <Separator orientation='vertical' className='mr-2 h-4' />
        <Link
          href='/dashboard'
          className={`${playfair.className} text-lg uppercase tracking-widest font-extrabold text-primary hover:opacity-80 transition-opacity`}
        >
          Momentum Learning
        </Link>
      </div>
    </header>
  );
}
