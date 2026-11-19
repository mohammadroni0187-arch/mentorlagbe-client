"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCog,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { authClient } from "@/lib/auth-client";
import { BRAND_NAME } from "@/lib/constants";
import { getUserRole, ROUTES, type Role } from "@/lib/roles";

const NAV_LINKS = [
  { label: "Home", href: ROUTES.home },
  { label: "Browse Tuitions", href: ROUTES.tuitions },
  { label: "Pricing", href: ROUTES.pricing },
  { label: "How It Works", href: ROUTES.howItWorks },
  { label: "About", href: ROUTES.about },
];

const ROLE_BADGE: Record<Role, { label: string; className: string }> = {
  student: { label: "Student", className: "bg-indigo-100 text-indigo-700" },
  tutor: { label: "Tutor", className: "bg-purple-100 text-purple-700" },
  admin: { label: "Admin", className: "bg-pink-100 text-pink-700" },
};

const gradientBtn =
  "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 transition-all hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-lg";

type UserAvatarProps = {
  name: string;
  image?: string | null;
  className?: string;
};

/** Profile image thakle seta, na thakle name-er prothom akkhor. */
function UserAvatar({ name, image, className = "h-9 w-9" }: UserAvatarProps) {
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
        className={`${className} shrink-0 rounded-full object-cover ring-2 ring-indigo-100`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-sm font-semibold text-white`}
    >
      {initial}
    </span>
  );
}

function RoleBadge({ role }: { role: Role | null }) {
  if (!role) return null;
  const { label, className } = ROLE_BADGE[role];
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none ${className}`}
    >
      {label}
    </span>
  );
}

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const user = session?.user;
  const role = getUserRole(user);

  const isActive = (href: string) =>
    href === ROUTES.home
      ? pathname === "/"
      : !href.includes("#") && pathname.startsWith(href);

  const closeMenu = () => setOpen(false);

  const handleSignOut = async () => {
    closeMenu();
    await authClient.signOut();
    router.replace(ROUTES.home);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-indigo-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        {/* Brand */}
        <Link href={ROUTES.home} className="flex shrink-0 items-center gap-2" onClick={closeMenu}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-lg font-bold text-transparent">
            {BRAND_NAME}
          </span>
        </Link>

        {/* Desktop navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {NAV_LINKS.map(({ label, href }) => (
              <NavigationMenuItem key={label}>
                <NavigationMenuLink
                  active={isActive(href)}
                  className={navigationMenuTriggerStyle()}
                  render={<Link href={href}>{label}</Link>}
                />
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop auth */}
        
{/* Desktop auth */}
<div className="hidden items-center gap-3 lg:flex">
  {isPending ? (
    <div className="h-10 w-48 animate-pulse rounded-lg bg-indigo-100" />
  ) : user ? (
    <div className="relative">
      {/* Profile Button */}
      <button
        type="button"
        onClick={() => setProfileOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white px-3 py-2 transition hover:bg-indigo-50"
        aria-expanded={profileOpen}
        aria-haspopup="menu"
      >
        <UserAvatar
          name={user.name}
          image={user.image}
          className="h-10 w-10"
        />

        <div className="flex min-w-0 flex-col items-start gap-1">
          <span className="max-w-32 truncate text-sm font-semibold text-slate-800">
            {user.name}
          </span>
          <RoleBadge role={role} />
        </div>

        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform ${
            profileOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {profileOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-indigo-100 bg-white p-2 shadow-xl"
        >
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user.name}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user.email}
            </p>
          </div>

          <Link
            href={ROUTES.dashboard}
            onClick={() => setProfileOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href={ROUTES.profile}
            onClick={() => setProfileOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <UserCog className="h-4 w-4" />
            Profile
          </Link>

          <button
            type="button"
            onClick={async () => {
              setProfileOpen(false);
              await handleSignOut();
            }}
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  ) : (
    <>
      <Link
        href={ROUTES.signIn}
        className={`${buttonVariants({ variant: "ghost" })} text-indigo-700`}
      >
        Sign In
      </Link>

      <Link
        href={ROUTES.signUp}
        className={`${buttonVariants()} ${gradientBtn}`}
      >
        Sign Up
      </Link>
    </>
  )}
</div>


        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-indigo-100 bg-white lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4" aria-label="Mobile">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={closeMenu}
                aria-current={isActive(href) ? "page" : undefined}
                className={`rounded-md px-3 py-2.5 text-sm font-medium ${
                  isActive(href)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-indigo-50/60"
                }`}
              >
                {label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-indigo-100 pt-4">
              {isPending ? null : user ? (
                <>
                  <div className="flex items-center gap-3 px-3 pb-1">
                    <UserAvatar name={user.name} image={user.image} className="h-10 w-10" />
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-sm font-medium text-slate-800">
                        {user.name}
                      </span>
                      <RoleBadge role={role} />
                    </div>
                  </div>

                  <Link
                    href={ROUTES.dashboard}
                    onClick={closeMenu}
                    className={`${buttonVariants()} ${gradientBtn}`}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href={ROUTES.profile}
                    onClick={closeMenu}
                    className={`${buttonVariants({ variant: "outline" })} border-indigo-200`}
                  >
                    <UserCog className="mr-2 h-4 w-4" />
                    Update Profile
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="text-slate-600 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href={ROUTES.signIn}
                    onClick={closeMenu}
                    className={`${buttonVariants({ variant: "outline" })} border-indigo-200`}
                  >
                    Sign In
                  </Link>
                  <Link
                    href={ROUTES.signUp}
                    onClick={closeMenu}
                    className={`${buttonVariants()} ${gradientBtn}`}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;