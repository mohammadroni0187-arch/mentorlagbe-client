"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { ROLE_DASHBOARD, ROUTES } from "@/lib/roles";

const DashboardPage = () => {
  const router = useRouter();
  const { user, role, isLoading } = useRoleGuard();

  useEffect(() => {
    if (isLoading || !user) return; // login na thakle hook-i sign in-e pathabe

    router.replace(role ? ROLE_DASHBOARD[role] : ROUTES.home);
  }, [isLoading, user, role, router]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      <p className="text-sm font-medium text-slate-600">
        Redirecting to your dashboard...
      </p>
    </div>
  );
};

export default DashboardPage;