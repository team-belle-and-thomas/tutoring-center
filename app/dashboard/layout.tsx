import { ParentCreditWidget } from '@/components/add-credits/parent-credit-widget';
import { AppSidebar } from '@/components/app-sidebar';
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
  const footerSlot = userRole === 'parent' ? <ParentCreditWidget /> : null;

  const layout = (
    <div className='[--header-height:calc(--spacing(14))]'>
      <SidebarProvider className='flex flex-col'>
        <SiteHeader />
        <div className='flex flex-1'>
          <AppSidebar footerSlot={footerSlot}>
            <UserLinks links={links} />
          </AppSidebar>
          <SidebarInset>{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );

  return layout;
}
