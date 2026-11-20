"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  CreditCard,
  Crown,
  FileText,
  Globe,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { BRAND_NAME } from "@/lib/constants";
import { getUserRole, ROUTES, type Role } from "@/lib/roles";

/* ------------------------------------------------------------------ */
/* Menu config                                                         */
/* ------------------------------------------------------------------ */

type MenuItem = {
  name: string;
  url: string;
  icon: LucideIcon;
  
  exact?: boolean;
};

type MenuGroup = { title: string; items: MenuItem[] };


const MENUS: Record<Role, MenuGroup[]> = {
  student: [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", url: "/dashboard/student", icon: LayoutDashboard, exact: true },
        { name: "My Profile", url: ROUTES.profile, icon: UserRound, exact: true },
      ],
    },
    {
      title: "Tuition",
      items: [
        { name: "Browse Tuitions", url: ROUTES.tuitions, icon: Search, exact: true },
        { name: "My Applications", url: "/dashboard/student/applications", icon: FileText },
      ],
    },
    {
      title: "Account",
      items: [{ name: "Payments", url: "/dashboard/student/payments", icon: CreditCard }],
    },
  ],

  tutor: [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", url: "/dashboard/tutor", icon: LayoutDashboard, exact: true },
        { name: "My Profile", url: ROUTES.profile, icon: UserRound, exact: true },
      ],
    },
    {
      title: "Manage Tuition",
      items: [
        { name: "Post Tuition", url: "/dashboard/tutor/postTuition", icon: PlusCircle },
        { name: "My Tuitions", url: "/dashboard/tutor/myTuition", icon: BookOpen },
        { name: "Applicants", url: "/dashboard/tutor/applicants", icon: ClipboardList },
      ],
    },
    {
      title: "Account",
      items: [{ name: "Payments", url: "/dashboard/tutor/payment", icon: CreditCard }],
    },
  ],

  admin: [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard, exact: true },
        { name: "My Profile", url: ROUTES.profile, icon: UserRound, exact: true },
      ],
    },
    {
      title: "Management",
      items: [
        { name: "Users", url: "/dashboard/admin/users", icon: Users },
        { name: "Tuitions", url: "/dashboard/admin/tuitions", icon: BookOpen },
        { name: "Transactions", url: "/dashboard/admin/transactions", icon: CreditCard },
      ],
    },
  ],
};

const ROLE_BADGE: Record<Role, string> = {
  student: "bg-indigo-500/20 text-indigo-300 ring-indigo-400/30",
  tutor: "bg-purple-500/20 text-purple-300 ring-purple-400/30",
  admin: "bg-pink-500/20 text-pink-300 ring-pink-400/30",
};

const menuButtonClass =
  "h-10 gap-3 rounded-lg px-3 text-slate-400 transition-colors hover:bg-white/5 hover:text-white data-[active=true]:bg-gradient-to-r data-[active=true]:from-indigo-600 data-[active=true]:via-purple-600 data-[active=true]:to-pink-600 data-[active=true]:font-medium data-[active=true]:text-white data-[active=true]:shadow-md data-[active=true]:shadow-purple-500/25";

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

const SidebarAvatar = ({ name, image }: { name: string; image?: string | null }) => {
  const [broken, setBroken] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "U";

  if (image && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-purple-400/50"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-base font-semibold text-white ring-2 ring-purple-400/50"
    >
      {initial}
    </span>
  );
};

const MenuSkeleton = () => (
  <div className="space-y-2 px-1 pt-2" aria-busy="true" aria-label="Loading menu">
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-10 animate-pulse rounded-lg bg-white/5" />
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const role: Role = getUserRole(user) ?? "student";
  const isPro = (user as { plan?: unknown } | undefined)?.plan === "pro";

  const isItemActive = ({ url, exact }: MenuItem) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(`${url}/`);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace(ROUTES.home);
    router.refresh();
  };

  return (
    <Sidebar>
      <div className="relative flex h-full flex-col overflow-hidden bg-slate-950 text-slate-300">
        {/* soft gradient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-transparent blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-gradient-to-tl from-pink-600/20 via-purple-600/10 to-transparent blur-3xl"
        />

        {/* Header: logo + user card */}
        <SidebarHeader className="relative gap-5 p-4 pb-2">
          <Link href={ROUTES.home} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-lg font-bold tracking-tight text-transparent">
                {BRAND_NAME}
              </span>
              <span className="block text-xs text-slate-500">Dashboard</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
            {isPending ? (
              <>
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-white/10" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-32 animate-pulse rounded bg-white/5" />
                </div>
              </>
            ) : (
              <>
                <SidebarAvatar name={user?.name ?? "User"} image={user?.image} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{user?.name || "User"}</p>
                  <p className="truncate text-xs text-slate-400">{user?.email}</p>
                  <span
                    className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${ROLE_BADGE[role]}`}
                  >
                    {role}
                  </span>
                </div>
              </>
            )}
          </div>
        </SidebarHeader>

        {/* Menu */}
        <SidebarContent className="relative px-2 py-2">
          {isPending ? (
            <MenuSkeleton />
          ) : (
            <nav aria-label="Dashboard navigation">
              {MENUS[role].map((group) => (
                <SidebarGroup key={group.title} className="py-2">
                  <SidebarGroupLabel className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {group.title}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-1">
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.url}>
                          <SidebarMenuButton
                            isActive={isItemActive(item)}
                            tooltip={item.name}
                            render={<Link href={item.url} />}
                            className={menuButtonClass}
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span>{item.name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </nav>
          )}
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="relative gap-3 border-t border-white/10 p-4">
          {!isPending && role === "tutor" && (
            <div
              className={`rounded-xl border p-3 ${
                isPro
                  ? "border-purple-400/30 bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2">
                <Crown className={`h-4 w-4 ${isPro ? "text-amber-300" : "text-slate-400"}`} />
                <p className="text-sm font-semibold text-white">{isPro ? "Pro plan" : "Free plan"}</p>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {isPro ? "Unlimited tuition posts." : "Up to 2 tuition posts."}
              </p>
              {!isPro && (
                <Link
                  href={ROUTES.pricing}
                  className="mt-3 block rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-3 py-2 text-center text-xs font-semibold text-white shadow-md shadow-purple-500/25 transition-all hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700"
                >
                  Upgrade to Pro
                </Link>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={ROUTES.home}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Globe className="h-4 w-4" />
              Website
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}

export default DashboardSidebar;