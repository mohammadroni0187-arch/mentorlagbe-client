import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const ACCENTS = {
  indigo: "bg-indigo-100 text-indigo-600",
  purple: "bg-purple-100 text-purple-600",
  pink: "bg-pink-100 text-pink-600",
  emerald: "bg-emerald-100 text-emerald-600",
} as const;

export type StatAccent = keyof typeof ACCENTS;

export type StatCardProps = {
  title: string;
  /** number/string dekhabe, null hole "—" (jemon load fail korle) */
  value: number | string | null;
  icon: LucideIcon;
  accent?: StatAccent;
  /** value-r niche choto line */
  hint?: string;
  /** true hole value-r jaygay skeleton dekhay */
  loading?: boolean;
  /** Card-er niche optional link (jemon "Upgrade") */
  action?: { label: string; href: string };
};

/**
 * Reusable dashboard stat card.
 * Student, tutor ba admin, je kono dashboard-e use kora jabe.
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  accent = "indigo",
  hint,
  loading = false,
  action,
}: StatCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>

          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-indigo-100" aria-hidden="true" />
          ) : (
            <p className="mt-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
              {value ?? "—"}
            </p>
          )}
        </div>

        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ACCENTS[accent]}`}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>

      {loading ? (
        <div className="mt-3 h-3 w-32 animate-pulse rounded bg-indigo-50" aria-hidden="true" />
      ) : (
        hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>
      )}

      {action && !loading && (
        <Link
          href={action.href}
          className="mt-3 w-fit text-sm font-medium text-indigo-600 underline-offset-4 hover:text-purple-600 hover:underline"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}

export default StatCard;