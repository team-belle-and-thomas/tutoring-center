'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SidebarLink } from '@/lib/dashboard-links';
import { BookOpen, Calendar, CreditCard, GraduationCap, LayoutDashboard, User, Users } from 'lucide-react';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  layoutDashboard: LayoutDashboard,
  graduationCap: GraduationCap,
  users: Users,
  user: User,
  calendar: Calendar,
  creditCard: CreditCard,
  bookOpen: BookOpen,
};

export function UserLinks({ links }: { links: SidebarLink[] }) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map(link => {
        const Icon = iconMap[link.icon];
        return (
          <SidebarMenuItem key={link.id}>
            <SidebarMenuButton
              asChild
              isActive={link.href === pathname}
              className='data-[active=true]:text-primary data-[active=true]:font-semibold'
            >
              <Link href={link.href} className='font-sans'>
                <Icon className='size-5' />
                <span className='ml-2'>{link.text}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
