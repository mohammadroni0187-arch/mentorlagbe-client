
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  BookOpen,
  BadgeCheck,
  Wallet,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Settings,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { apiFetch } from "@/lib/api";

type AdminStats = {
  totalUsers?: number;
  totalTutors?: number;
  pendingTuitions?: number;
  approvedTuitions?: number;
  totalRevenue?: number;
};

const adminLinks = [
  {
    title: "User Management",
    description: "View users and manage account roles.",
    href: "/dashboard/admin/users",
    icon: Users,
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "Tuition Approval",
    description: "Review, approve or reject tuition posts.",
    href: "/dashboard/admin/tuitions",
    icon: ClipboardList,
    color: "from-purple-500 to-fuchsia-600",
  },
  {
    title: "Transactions",
    description: "View subscription payments and revenue.",
    href: "/dashboard/admin/transactions",
    icon: CreditCard,
    color: "from-emerald-500 to-teal-600",
  },
];

const AdminPage = () => {
  const { user, isLoading, isAuthorized } = useRoleGuard("admin");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch<{
        success?: boolean;
        data?: AdminStats;
        stats?: AdminStats;
      }>("/api/admin/stats");

      setStats(response.data ?? response.stats ?? response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Dashboard statistics load failed."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized && user) loadStats();
  }, [isAuthorized, user]);

  if (isLoading || !isAuthorized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers,
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Tutors",
      value: stats?.totalTutors,
      icon: GraduationCap,
      gradient: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
    },
    {
      title: "Pending Tuitions",
      value: stats?.pendingTuitions,
      icon: BookOpen,
      gradient: "from-amber-400 to-orange-500",
      bg: "bg-amber-50",
    },
    {
      title: "Approved Tuitions",
      value: stats?.approvedTuitions,
      icon: BadgeCheck,
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Total Revenue",
      value:
        stats?.totalRevenue !== undefined
          ? `৳${stats.totalRevenue.toLocaleString("en-BD")}`
          : undefined,
      icon: Wallet,
      gradient: "from-pink-500 to-rose-600",
      bg: "bg-pink-50",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 p-7 text-white shadow-xl md:p-10">
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100">
                <ShieldCheck className="h-4 w-4" />
                Administrator Panel
              </div>
              <h1 className="text-3xl font-bold md:text-4xl">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-sm text-indigo-100 md:text-base">
                Welcome back, {user.name}. Manage your platform from here.
              </p>
            </div>

            <button
              onClick={loadStats}
              disabled={loading}
              className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
            </button>
          </div>
        </section>

        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button onClick={loadStats} className="font-semibold underline">
              Try again
            </button>
          </div>
        )}

        <section className="mb-9">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Platform Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Key statistics and platform performance
              </p>
            </div>
            <Settings className="h-5 w-5 text-indigo-500" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {statCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-2xl border border-white bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`absolute right-0 top-0 h-28 w-28 rounded-bl-full ${item.bg} opacity-70`} />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {item.title}
                      </p>
                      <p className="mt-3 text-3xl font-bold text-slate-800">
                        {loading ? (
                          <span className="inline-block h-9 w-16 animate-pulse rounded bg-slate-200" />
                        ) : (
                          item.value ?? 0
                        )}
                      </p>
                    </div>
                    <div className={`rounded-xl bg-gradient-to-br ${item.gradient} p-3 text-white shadow-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className={`relative mt-5 h-1.5 w-full rounded-full ${item.bg}`}>
                    <div className={`h-1.5 w-1/2 rounded-full bg-gradient-to-r ${item.gradient}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800">
              Management Center
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage users, tuition posts and payments
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {adminLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-white bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className={`rounded-xl bg-gradient-to-br ${item.color} p-3 text-white shadow-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-indigo-600" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-800 group-hover:text-indigo-700">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminPage;
