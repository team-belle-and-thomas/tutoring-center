import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import LogoutButton from './logout-button';

export function AppSidebar({ children }: { children: Readonly<React.ReactNode> }) {
  return (
    <Sidebar className='top-(--header-height) h-[calc(100svh-var(--header-height))]!'>
      <SidebarContent>{children}</SidebarContent>
      <SidebarFooter>
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
