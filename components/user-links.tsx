'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarLink } from '@/app/dashboard/mock-api';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';

export function UserLinks({ links }: { links: SidebarLink[] }) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map(link => (
        <SidebarMenuItem key={link.id}>
          <SidebarMenuButton
            asChild
            isActive={link.href === pathname}
            className='data-[active=true]:text-primary data-[active=true]:font-semibold'
          >
            <Link href={link.href} className='font-sans'>
              <span className='ml-2'>{link.text}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
