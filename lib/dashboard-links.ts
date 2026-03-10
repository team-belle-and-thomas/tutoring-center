import type { Route } from 'next';

export type UserRole = 'admin' | 'parent' | 'tutor';

export interface SidebarLink {
  id: number;
  href: Route;
  text: string;
  icon: string;
}

export function getUserLinks(role: UserRole) {
  switch (role) {
    case 'admin':
      return adminLinks;
    case 'parent':
      return parentLinks;
    case 'tutor':
      return tutorLinks;
    default:
      throw new Error('Invalid user role');
  }
}

const adminLinks: SidebarLink[] = [
  { id: 1, href: '/dashboard', text: 'Dashboard', icon: 'layoutDashboard' },
  { id: 2, href: '/dashboard/tutors', text: 'Tutors', icon: 'graduationCap' },
  { id: 3, href: '/dashboard/parents', text: 'Parents', icon: 'users' },
  { id: 4, href: '/dashboard/students', text: 'Students', icon: 'user' },
  { id: 5, href: '/dashboard/sessions', text: 'Sessions', icon: 'calendar' },
  {
    id: 6,
    href: '/dashboard/credit-transactions',
    text: 'Credit Transactions',
    icon: 'creditCard',
  },
];

const parentLinks: SidebarLink[] = [
  { id: 1, href: '/dashboard', text: 'Dashboard', icon: 'layoutDashboard' },
  { id: 2, href: '/dashboard/students', text: 'Students', icon: 'user' },
  { id: 3, href: '/dashboard/sessions', text: 'Sessions', icon: 'calendar' },
  {
    id: 4,
    href: '/dashboard/credit-transactions',
    text: 'Credit Transactions',
    icon: 'creditCard',
  },
  {
    id: 5,
    href: '/dashboard/grades',
    text: 'Grades',
    icon: 'bookOpen',
  },
];

const tutorLinks: SidebarLink[] = [
  { id: 1, href: '/dashboard', text: 'Dashboard', icon: 'layoutDashboard' },
  { id: 2, href: '/dashboard/sessions', text: 'Sessions', icon: 'calendar' },
];
