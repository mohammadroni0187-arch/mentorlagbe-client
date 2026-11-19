
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserRound,
  BookOpen,
  Search,
  FileText,
  CreditCard,
  Users,
  GraduationCap,
  PlusCircle,
  ClipboardList,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { authClient } from "@/lib/auth-client";

const menuItems = {
  student: [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", url: "/dashboard/student", icon: LayoutDashboard },
        { name: "My Profile", url: "/dashboard/student/profile", icon: UserRound },
      ],
    },
    {
      title: "Tuition",
      items: [
        { name: "Browse Tuitions", url: "/tuitions", icon: Search },
        { name: "My Applications", url: "/dashboard/student/my-applications", icon: FileText },
        { name: "My Tuitions", url: "/dashboard/student/my-tuitions", icon: BookOpen },
      ],
    },
    {
      title: "Account",
      items: [
        { name: "Payments", url: "/dashboard/student/payments", icon: CreditCard },
        { name: "Settings", url: "/dashboard/student/settings", icon: Settings },
      ],
    },
  ],

  tutor: [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", url: "/dashboard/tutor", icon: LayoutDashboard },
        { name: "My Profile", url: "/dashboard/tutor/profile", icon: UserRound },
      ],
    },
    {
      title: "Manage Tuition",
      items: [
        { name: "Post Tuition", url: "/dashboard/tutor/post-tuition", icon: PlusCircle },
        { name: "My Tuitions", url: "/dashboard/tutor/my-tuitions", icon: BookOpen },
        { name: "Applications", url: "/dashboard/tutor/applications", icon: ClipboardList },
      ],
    },
    {
      title: "Account",
      items: [
        { name: "Payments", url: "/dashboard/tutor/payments", icon: CreditCard },
        { name: "Settings", url: "/dashboard/tutor/settings", icon: Settings },
      ],
    },
  ],

  admin: [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "Management",
      items: [
        { name: "Users", url: "/dashboard/admin/users", icon: Users },
        { name: "Tuitions", url: "/dashboard/admin/tuitions", icon: BookOpen },
        { name: "Applications", url: "/dashboard/admin/applications", icon: ClipboardList },
        { name: "Payments", url: "/dashboard/admin/payments", icon: CreditCard },
      ],
    },
    {
      title: "Account",
      items: [
        { name: "Settings", url: "/dashboard/admin/settings", icon: Settings },
      ],
    },
  ],
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  const role = session?.user?.role as "student" | "tutor" | "admin" | undefined;

  const currentMenu = menuItems[role || "student"];

  return (
    <Sidebar>
      {/* Header */}
      
      {/* Sidebar Header + User Profile */}
      <SidebarHeader className="border-b px-4 py-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight">
              MentorLagbe
            </h2>
            <p className="text-xs text-muted-foreground">
              Dashboard Panel
            </p>
          </div>
        </Link>

        {/* Logged-in User Profile */}
        <div className="mt-5 flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {isPending ? "Loading..." : session?.user?.name || "User"}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {session?.user?.email || ""}
            </p>

            <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
              {role || "User"}
            </span>
          </div>
        </div>
      </SidebarHeader>


      {/* Sidebar Menu */}
      <SidebarContent className="px-3 py-4">
        {isPending ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            Loading menu...
          </p>
        ) : (
          currentMenu.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </SidebarGroupLabel>

              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url;

                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.name}
                        render={<Link href={item.url} />}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>

      {/* Footer */}
      
    </Sidebar>
  );
}
