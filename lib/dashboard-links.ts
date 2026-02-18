import type { Route } from 'next';

export type UserRole = 'admin' | 'parent';

export interface SidebarLink {
  id: number;
  href: Route;
  text: string;
}

export function getUserLinks(role: UserRole) {
  switch (role) {
    case 'admin':
      return adminLinks;
    case 'parent':
      return parentLinks;
    default:
      throw new Error('Invalid user role');
  }
}

const adminLinks: SidebarLink[] = [
  { id: 1, href: '/dashboard', text: 'Dashboard' },
  { id: 2, href: '/dashboard/tutors', text: 'Tutors' },
  { id: 3, href: '/dashboard/parents', text: 'Parents' },
  { id: 4, href: '/dashboard/students', text: 'Students' },
  { id: 5, href: '/dashboard/sessions', text: 'Sessions' },
  {
    id: 6,
    href: '/dashboard/credit-transactions',
    text: 'Credit Transactions',
  },
  { id: 7, href: '/dashboard/progress-reports', text: 'Progress Reports' },
];

const parentLinks: SidebarLink[] = [
  { id: 1, href: '/dashboard', text: 'Dashboard' },
  { id: 2, href: '/dashboard/students', text: 'Students' },
  { id: 3, href: '/dashboard/sessions', text: 'Sessions' },
  {
    id: 4,
    href: '/dashboard/credit-transactions',
    text: 'Credit Transactions',
  },
  { id: 5, href: '/dashboard/progress-reports', text: 'Progress Reports' },
];
