
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  FileText,
  Loader2,
  Search,
  RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/lib/roles";
import StatCard from "@/components/dashboard/stat-card/page";

type DashboardCard = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
};

const CARDS: DashboardCard[] = [
  {
    title: "Browse Tuitions",
    description: "Find your preferred tuition.",
    href: "/tuitions",
    icon: Search,
    accent: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "My Applications",
    description: "Track your applications.",
    href: "/dashboard/student/applications",
    icon: FileText,
    accent: "bg-purple-100 text-purple-600",
  },
  {
    title: "My Payments",
    description: "View your payment history.",
    href: "/dashboard/student/payment",
    icon: CreditCard,
    accent: "bg-pink-100 text-pink-600",
  },
];

type StudentStats = {
  totalApplied?: number;
  accepted?: number;
  pending?: number;
  currentPlan?: string;
  freeApplicationLimit?: number;
  freeApplicationsUsed?: number;
  remainingFreeApplications?: number | null;
  canApply?: boolean;
};

type StudentStatsResponse = {
  success?: boolean;
  data?: StudentStats;
} & StudentStats;

const fetchStudentStats = (): Promise<StudentStatsResponse> =>
  apiFetch<StudentStatsResponse>("/api/applications/student/stats");

const StudentPage = () => {
  const { user, isLoading, isAuthorized } = useRoleGuard("student");

  const [stats, setStats] = useState<StudentStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");

  const applyStats = useCallback((response: StudentStatsResponse) => {
    setStats(response.data ?? response);
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setError("");
    try {
      applyStats(await fetchStudentStats());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load dashboard stats.";
      setError(message);
      toast.error(message);
    } finally {
      setStatsLoading(false);
    }
  }, [applyStats]);

  useEffect(() => {
    if (!isAuthorized || !user) return;

    let cancelled = false;

    fetchStudentStats()
      .then((response) => {
        if (!cancelled) {
          applyStats(response);
          setStatsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Could not load dashboard stats.";
          setError(message);
          toast.error(message);
          setStatsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthorized, user, applyStats]);

  if (isLoading || !isAuthorized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  const plan =
    stats?.currentPlan?.toLowerCase() === "pro" ||
    stats?.currentPlan?.toLowerCase() === "premium"
      ? "Pro"
      : "Free";

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
              Student Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Welcome back, <span className="font-medium">{user.name}</span>!
            </p>
          </div>

          <button
            onClick={loadStats}
            disabled={statsLoading}
            className="inline-flex items-center rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${statsLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Applied Tuitions"
            value={stats?.totalApplied ?? null}
            icon={FileText}
            accent="indigo"
            loading={statsLoading}
          />
          <StatCard
            title="Accepted Applications"
            value={stats?.accepted ?? null}
            icon={CreditCard}
            accent="emerald"
            loading={statsLoading}
          />
          <StatCard
            title="Pending Applications"
            value={stats?.pending ?? null}
            icon={Search}
            accent="pink"
            loading={statsLoading}
          />
          <StatCard
            title="Current Plan"
            value={plan}
            icon={CreditCard}
            accent="purple"
            loading={statsLoading}
            hint={
              plan === "Free"
                ? `${stats?.remainingFreeApplications ?? "—"} of ${
                    stats?.freeApplicationLimit ?? 2
                  } free applications remaining`
                : "Unlimited applications on Pro"
            }
            action={
              plan === "Free"
                ? { label: "Upgrade to Pro", href: ROUTES.pricing }
                : undefined
            }
          />
        </section>

        {error && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {error}
          </div>
        )}

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {CARDS.map(({ title, description, href, icon: Icon, accent }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-slate-900 group-hover:text-indigo-700">
                {title}
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">{description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
};

export default StudentPage;
