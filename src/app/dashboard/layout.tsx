import { DashboardSidebar } from "@/components/dashboard/dashboardSidebar/page";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Mobile-e eta diye sidebar khola jay */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-indigo-100 bg-white/70 px-4 backdrop-blur">
          <SidebarTrigger className="text-slate-600 hover:bg-indigo-50 hover:text-indigo-700" />
          <span className="text-sm font-medium text-slate-700">Dashboard</span>
        </header>

        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}