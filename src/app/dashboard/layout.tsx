

import { DashboardSidebar } from "@/components/dashboardSidebar/page";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function DashboardLayout({children,}: {children: React.ReactNode;}) {
  return (
     <SidebarProvider>
      <DashboardSidebar/>

      <main className="min-h-screen flex-1">
        <header className="flex h-14 items-center border-b px-4">
          <SidebarTrigger />
          <span className="ml-3 font-semibold">
            MentorLagbe Dashboard
          </span>
        </header>

        <div className="p-4 md:p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
