"use client";

import Link from "next/link";
import { CreditCard, FileText, Loader2, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRoleGuard } from "@/hooks/use-role-guard";

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
    href: "/dashboard/student/payments",
    icon: CreditCard,
    accent: "bg-pink-100 text-pink-600",
  },
];

const StudentPage = () => {
  const { user, isLoading, isAuthorized } = useRoleGuard("student");

  

  if (isLoading || !isAuthorized || !user) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
              Student Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Welcome back, <span className="font-medium">{user.name}</span>!
            </p>
          </div>

        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {CARDS.map(({ title, description, href, icon: Icon, accent }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}
              >
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