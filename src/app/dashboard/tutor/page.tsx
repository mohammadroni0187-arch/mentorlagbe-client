"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BookOpen,
  Crown,
  Loader2,
  LogOut,
  PlusCircle,
  RefreshCw,
  UserCog,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { ROUTES } from "@/lib/roles";
import { TUITION_ENDPOINTS, extractTuitions, type Tuition } from "@/lib/tuition";
import StatCard from "@/components/dashboard/stat-card/page";


/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const FREE_POST_LIMIT = 2;

// Backend-er route onujayi change korben (applicants page-er sathe ekoi)
const APPLICANTS_ENDPOINT = "/api/applications/tutor";

type Plan = "free" | "pro";

const getPlan = (user: unknown): Plan => {
  const plan = (user as { plan?: unknown } | null | undefined)?.plan;

  return typeof plan === "string" &&
    ["pro", "premium"].includes(plan.toLowerCase())
    ? "pro"
    : "free";
};

/** Response array, `{ data: [...] }` ba `{ total }` jai hok, count ber kore. */
const countFrom = (res: unknown): number | null => {
  if (Array.isArray(res)) return res.length;
  if (res && typeof res === "object") {
    const r = res as { data?: unknown; total?: unknown };
    if (Array.isArray(r.data)) return r.data.length;
    if (typeof r.total === "number") return r.total;
  }
  return null;
};

type QuickLink = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
};

const QUICK_LINKS: QuickLink[] = [
  {
    title: "Post a Tuition",
    description: "Create a new tuition post.",
    href: "/dashboard/tutor/postTuition",
    icon: PlusCircle,
    accent: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "My Tuitions",
    description: "Edit, close or delete your posts.",
    href: "/dashboard/tutor/myTuition",
    icon: BookOpen,
    accent: "bg-purple-100 text-purple-600",
  },
  {
    title: "Applicants",
    description: "Review students who applied.",
    href: "/dashboard/tutor/applicants",
    icon: Users,
    accent: "bg-pink-100 text-pink-600",
  },
  {
    title: "Update Profile",
    description: "Change your name and photo.",
    href: ROUTES.profile,
    icon: UserCog,
    accent: "bg-emerald-100 text-emerald-600",
  },
];






/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

const TutorOverview = ({ plan }: { plan: Plan }) => {
  // null mane load hoyni
  const [tuitions, setTuitions] = useState<Tuition[] | null>(null);
  const [applicants, setApplicants] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // Duto request ekshathe, ekta fail korleo arektar data dekhabo
    Promise.allSettled([
      apiFetch<unknown>(TUITION_ENDPOINTS.list),
      apiFetch<unknown>(APPLICANTS_ENDPOINT),
    ]).then(([tuitionsResult, applicantsResult]) => {
      if (cancelled) return;

      setTuitions(tuitionsResult.status === "fulfilled" ? extractTuitions(tuitionsResult.value) : null);
      setApplicants(applicantsResult.status === "fulfilled" ? countFrom(applicantsResult.value) : null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const total = tuitions?.length ?? null;
  const approved = tuitions?.filter((t) => t.approvalStatus === "approved").length ?? 0;
  const pending = tuitions?.filter((t) => t.approvalStatus === "pending").length ?? 0;
  const live =
    tuitions?.filter((t) => t.approvalStatus === "approved" && t.status === "active").length ?? null;

  const totalHint =
    plan === "pro"
      ? "Unlimited posts on Pro"
      : total === null
        ? undefined
        : `${Math.min(total, FREE_POST_LIMIT)} of ${FREE_POST_LIMIT} free posts used`;

  const hasLoadError = !loading && (tuitions === null || applicants === null);

  return (
    <>
      <section
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Overview statistics"
        aria-busy={loading}
      >
        <StatCard
          title="Total Tuitions Posted"
          value={total}
          icon={BookOpen}
          accent="indigo"
          hint={totalHint}
          loading={loading}
        />
        <StatCard
          title="Active / Approved Tuitions"
          value={live}
          icon={BadgeCheck}
          accent="emerald"
          hint={tuitions ? `${approved} approved · ${pending} pending review` : undefined}
          loading={loading}
        />
        <StatCard
          title="Total Applicants"
          value={applicants}
          icon={Users}
          accent="pink"
          hint={applicants === null ? "Could not load applicants" : "Across all your tuitions"}
          loading={loading}
        />
        <StatCard
          title="Current Plan"
          value={plan === "pro" ? "Pro" : "Free"}
          icon={Crown}
          accent="purple"
          hint={plan === "pro" ? "Unlimited tuition posts" : `Up to ${FREE_POST_LIMIT} tuition posts`}
          action={plan === "free" ? { label: "Upgrade to Pro", href: ROUTES.pricing } : undefined}
        />
      </section>

      {hasLoadError && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p>Some stats could not be loaded.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={retry}
            className="border-amber-300 bg-white/70 hover:bg-amber-100"
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Try again
          </Button>
        </div>
      )}

      <section className="mt-10" aria-label="Quick actions">
        <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK_LINKS.map(({ title, description, href, icon: Icon, accent }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const TutorPage = () => {
  const router = useRouter();
  const { user, isLoading, isAuthorized } = useRoleGuard("tutor");

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace(ROUTES.signIn);
  };

  if (isLoading || !isAuthorized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
              Tutor Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Welcome back, <span className="font-medium">{user.name}</span>!
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleSignOut}
            className="border-indigo-200 hover:bg-indigo-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </header>

        
        <TutorOverview plan={getPlan(user)} />
      </div>
    </main>
  );
};

export default TutorPage;