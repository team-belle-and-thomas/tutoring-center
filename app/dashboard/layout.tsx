import { ParentCreditWidget } from '@/components/add-credits/parent-credit-widget';
import { AppSidebar } from '@/components/app-sidebar';
import { NewSessionButton } from '@/components/new-session-button';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { UserLinks } from '@/components/user-links';
import { getUserRole } from '@/lib/auth';
import { getUserLinks } from '@/lib/dashboard-links';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userRole = await getUserRole();
  const links = getUserLinks(userRole);
  const headerSlot = userRole === 'parent' ? <NewSessionButton /> : null;
  const footerSlot = userRole === 'parent' ? <ParentCreditWidget /> : null;

  const layout = (
    <div className='[--header-height:calc(--spacing(14))]'>
      <SidebarProvider className='flex flex-col'>
        <SiteHeader />
        <div className='flex flex-1'>
          <AppSidebar headerSlot={headerSlot} footerSlot={footerSlot}>
            <UserLinks links={links} />
          </AppSidebar>
          <SidebarInset>
            {children}
            <footer className='border-t py-4 px-6 text-center text-sm text-muted-foreground'>
              © {new Date().getFullYear()} Momentum Learning. All rights reserved.
            </footer>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );

  return layout;
}
