"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { ROLE_DASHBOARD, ROUTES } from "@/lib/roles";

const DashboardPage = () => {
  const router = useRouter();
  const { user, role, isLoading } = useRoleGuard();

  useEffect(() => {
    if (isLoading || !user) return; // login na thakle hook-i sign in-e pathabe

    router.replace(role ? ROLE_DASHBOARD[role] : ROUTES.home);
  }, [isLoading, user, role, router]);

  const firstName = user?.name?.trim().split(" ")[0];

  return (
    <div
      className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 text-center"
      role="status"
      aria-live="polite"
    >
      {/* background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-indigo-300/40 via-purple-300/40 to-pink-300/40 blur-3xl"
      />

      <div className="relative">
        {/* Spinning ring + logo */}
        <div className="relative mx-auto h-24 w-24">
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-indigo-100 border-t-purple-500 border-r-pink-400" />
          <span className="absolute inset-3 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30">
            <GraduationCap className="h-8 w-8" />
          </span>
        </div>

        <h1 className="mt-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
          {firstName ? `Welcome back, ${firstName}!` : "Welcome back!"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {role ? (
            <>
              Taking you to your <span className="font-medium capitalize text-slate-800">{role}</span>{" "}
              dashboard
            </>
          ) : (
            "Getting your dashboard ready"
          )}
        </p>

        {/* bouncing dots */}
        <div className="mt-5 flex justify-center gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-pink-500" />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;