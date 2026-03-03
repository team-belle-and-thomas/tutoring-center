import LogoutButton from '@/components/logout-button';
import { Separator } from '@/components/ui/separator';
import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';

export function AppSidebar({
  children,
  footerSlot,
}: {
  children: Readonly<React.ReactNode>;
  footerSlot?: React.ReactNode;
}) {
  return (
    <Sidebar className='top-(--header-height) h-[calc(100svh-var(--header-height))]!'>
      <SidebarContent>{children}</SidebarContent>
      <SidebarFooter>
        {footerSlot && (
          <>
            {footerSlot}
            <Separator className='my-3' />
          </>
        )}
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
