"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, ApiError } from "@/lib/api";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { ROUTES } from "@/lib/roles";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

// Backend-er route onujayi change korben
const ENDPOINTS = {
  list: "/api/applications/tutor", // tutor-er tuition-gulor shob application
  status: (id: string) => `/api/applications/${id}/status`, // PATCH { status }
};

type ApplicationStatus = "pending" | "accepted" | "rejected";

type Application = {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  preferredSchedule: string;
  note: string;
  tuitionTitle: string;
  status: ApplicationStatus;
  createdAt: string;
};

type Filter = "all" | ApplicationStatus;

const STATUS_STYLES: Record<ApplicationStatus, { label: string; className: string; icon: LucideIcon }> = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700", icon: Clock },
  accepted: { label: "Accepted", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700", icon: XCircle },
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const inputClass =
  "border-indigo-200 bg-white/70 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30";

const selectClass =
  "h-9 w-full rounded-md border border-indigo-200 bg-white/70 px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-indigo-500 focus-visible:ring-[3px] focus-visible:ring-indigo-500/30";

const NOTE_PREVIEW_LENGTH = 140;

/* ------------------------------------------------------------------ */
/* Response normalising                                                */
/* ------------------------------------------------------------------ */

const str = (v: unknown): string => (typeof v === "string" ? v : "");
const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : {};

/**
 * Backend flat field (studentName, studentEmail...) ba nested object
 * (student: { name, email }, tuition: { title }) jai pathak, duto-i handle kore.
 */
function normalizeApplication(raw: unknown): Application | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const rawId = r._id ?? r.id;

const id =
  typeof rawId === "string" || typeof rawId === "number"
    ? String(rawId)
    : rawId &&
        typeof rawId === "object" &&
        "$oid" in rawId
      ? String((rawId as { $oid: string }).$oid)
      : rawId &&
          typeof rawId === "object" &&
          "toString" in rawId
        ? String(rawId)
        : "";

if (!id || id === "[object Object]") return null;

  const student = obj(r.student);
  const tuition = obj(r.tuition ?? r.tuitionId);

  const schedule = r.preferredSchedule ?? r.schedule;

  return {
    id: String(id),
    studentName: str(r.studentName) || str(student.name) || "Unknown student",
    email: str(r.studentEmail) || str(r.email) || str(student.email),
    phone: str(r.studentPhone) || str(r.phone) || str(student.phone),
    preferredSchedule: Array.isArray(schedule) ? schedule.map(String).join(", ") : str(schedule),
    note: str(r.note) || str(r.message),
    tuitionTitle: str(r.tuitionTitle) || str(tuition.title) || "Untitled tuition",
    status: r.status === "accepted" || r.status === "rejected" ? r.status : "pending",
    createdAt: str(r.createdAt),
  };
}

function extractApplications(res: unknown): Application[] {
  let list: unknown[] = [];
  if (Array.isArray(res)) list = res;
  else if (res && typeof res === "object" && Array.isArray((res as { data?: unknown }).data))
    list = (res as { data: unknown[] }).data;

  const items = list.map(normalizeApplication).filter((a): a is Application => a !== null);

  // Notun application age
  return items.sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
}

const getErrorMessage = (err: unknown) =>
  err instanceof ApiError || err instanceof Error ? err.message : "Kichu ekta vul hoyeche, abar try korun";

const formatDate = (iso: string) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;
};

/* ------------------------------------------------------------------ */
/* Application card                                                    */
/* ------------------------------------------------------------------ */

const ApplicationCard = ({
  application,
  busy,
  onUpdate,
}: {
  application: Application;
  busy: boolean;
  onUpdate: (status: "accepted" | "rejected") => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const { status } = application;
  const badge = STATUS_STYLES[status];
  const BadgeIcon = badge.icon;
  const applied = formatDate(application.createdAt);

  const longNote = application.note.length > NOTE_PREVIEW_LENGTH;
  const noteText =
    longNote && !expanded ? `${application.note.slice(0, NOTE_PREVIEW_LENGTH).trimEnd()}...` : application.note;

  const initial = application.studentName.trim().charAt(0).toUpperCase() || "S";

  return (
    <article className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur transition-shadow hover:shadow-lg hover:shadow-indigo-500/10">
      {/* Top: student + status */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-base font-semibold text-white"
          >
            {initial}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900">{application.studentName}</h3>
            {applied && <p className="text-xs text-slate-500">Applied {applied}</p>}
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}
        >
          <BadgeIcon className="h-3.5 w-3.5" />
          {badge.label}
        </span>
      </div>

      {/* Details */}
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-start gap-2.5">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <div className="min-w-0">
            <dt className="text-xs text-slate-500">Tuition</dt>
            <dd className="font-medium text-slate-800">{application.tuitionTitle}</dd>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
          <div className="min-w-0">
            <dt className="text-xs text-slate-500">Preferred schedule</dt>
            <dd className="text-slate-800">{application.preferredSchedule || "Not specified"}</dd>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" />
          <div className="min-w-0">
            <dt className="text-xs text-slate-500">Email</dt>
            <dd className="truncate">
              {application.email ? (
                <a href={`mailto:${application.email}`} className="text-indigo-600 hover:underline">
                  {application.email}
                </a>
              ) : (
                <span className="text-slate-500">Not provided</span>
              )}
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <div className="min-w-0">
            <dt className="text-xs text-slate-500">Phone</dt>
            <dd>
              {application.phone ? (
                <a
                  href={`tel:${application.phone.replace(/[^\d+]/g, "")}`}
                  className="text-indigo-600 hover:underline"
                >
                  {application.phone}
                </a>
              ) : (
                <span className="text-slate-500">Not provided</span>
              )}
            </dd>
          </div>
        </div>
      </dl>

      {/* Note */}
      {application.note && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-indigo-50/60 p-3 text-sm">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <div className="min-w-0">
            <p className="whitespace-pre-line break-words text-slate-700">{noteText}</p>
            {longNote && (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="mt-1 text-xs font-medium text-indigo-600 hover:underline"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-indigo-100 pt-4">
        {busy && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" aria-label="Updating" />}

        {status === "pending" ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdate("rejected")}
              disabled={busy}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <X className="mr-1.5 h-4 w-4" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => onUpdate("accepted")}
              disabled={busy}
              className="bg-green-600 text-white shadow-md shadow-green-500/20 hover:bg-green-700"
            >
              <Check className="mr-1.5 h-4 w-4" />
              Accept
            </Button>
          </>
        ) : (
          <span className="text-xs text-slate-400">
            This application is already {status}.
          </span>
        )}
      </div>
    </article>
  );
};

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl border border-white/60 bg-white/80 p-5">
    <div className="flex items-center gap-3">
      <div className="h-11 w-11 rounded-full bg-indigo-100" />
      <div className="space-y-2">
        <div className="h-4 w-40 rounded bg-indigo-100" />
        <div className="h-3 w-24 rounded bg-indigo-50" />
      </div>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <div className="h-8 rounded bg-indigo-50" />
      <div className="h-8 rounded bg-indigo-50" />
      <div className="h-8 rounded bg-indigo-50" />
      <div className="h-8 rounded bg-indigo-50" />
    </div>
  </div>
);

const ApplicantsContent = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [filter, setFilter] = useState<Filter>("all");
  const [tuitionFilter, setTuitionFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiFetch<unknown>(ENDPOINTS.list)
      .then((res) => {
        if (cancelled) return;
        setApplications(extractApplications(res));
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          const message = getErrorMessage(err);
          setLoadError(message);
          toast.error(message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const notify = (type: "success" | "error", text: string) => {
    if (type === "success") toast.success(text);
    else toast.error(text);
  };

  const retry = () => {
    setLoading(true);
    setLoadError(null);
    setReloadKey((k) => k + 1);
  };

  const handleUpdate = async (application: Application, status: "accepted" | "rejected") => {
    setBusyId(application.id);
    try {
      await apiFetch(ENDPOINTS.status(application.id), { method: "PATCH", body: { status } });
      setApplications((list) =>
  list.map((a) =>
    a.id === application.id ? { ...a, status } : a
  )
);

setReloadKey((key) => key + 1);
      notify(
        "success",
        `${application.studentName}'s application ${status === "accepted" ? "accepted" : "rejected"}.`
      );
    } catch (err) {
      notify("error", getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const counts: Record<Filter, number> = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const tuitionTitles = Array.from(new Set(applications.map((a) => a.tuitionTitle))).sort();

  const q = query.trim().toLowerCase();
  const visible = applications.filter(
    (a) =>
      (filter === "all" || a.status === filter) &&
      (tuitionFilter === "all" || a.tuitionTitle === tuitionFilter) &&
      (!q ||
        a.studentName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.tuitionTitle.toLowerCase().includes(q))
  );

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by application status">
          {FILTERS.map(({ value, label }) => {
            const selected = filter === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setFilter(value)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                  selected
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30"
                    : "border border-indigo-200 bg-white/70 text-slate-700 hover:bg-indigo-50"
                }`}
              >
                {label}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                    selected ? "bg-white/25" : "bg-indigo-100 text-indigo-700"
                  }`}
                >
                  {counts[value]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email or tuition"
              aria-label="Search applicants"
              className={`${inputClass} pl-9`}
            />
          </div>
          <select
            value={tuitionFilter}
            onChange={(e) => setTuitionFilter(e.target.value)}
            aria-label="Filter by tuition"
            className={selectClass}
          >
            <option value="all">All tuitions</option>
            {tuitionTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Body */}
      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-medium text-red-700">{loadError}</p>
            <Button onClick={retry} variant="outline" className="mt-4 border-red-200 hover:bg-red-100">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-white/60 p-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <Inbox className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No applicants yet</h2>
            <p className="mt-1 text-sm text-slate-600">
              When students apply to your tuitions, they will show up here.
            </p>
          </div>
        ) : visible.length === 0 ? (
          <p className="rounded-2xl border border-indigo-100 bg-white/60 p-8 text-center text-sm text-slate-600">
            No applicants match your filters.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {visible.map((a) => (
              <ApplicationCard
                key={a.id}
                application={a}
                busy={busyId === a.id}
                onUpdate={(status) => handleUpdate(a, status)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const ApplicationsPage = () => {
  const { user, isLoading, isAuthorized } = useRoleGuard("tutor");

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
        <Link
          href={ROUTES.dashboard}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <header className="mb-6">
          <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
            Applicants
          </h1>
          <p className="mt-2 text-slate-600">
            Students who applied to your tuitions. Accept or reject each application.
          </p>
        </header>

        <ApplicantsContent />
      </div>
    </main>
  );
};

export default ApplicationsPage;