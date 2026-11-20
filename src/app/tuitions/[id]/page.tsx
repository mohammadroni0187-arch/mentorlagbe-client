"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Laptop,
  Loader2,
  MapPin,
  RefreshCw,
  Shuffle,
  Wallet,
  BookOpen,
  Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { getUserRole, ROUTES } from "@/lib/roles";
import {
  MODE_LABELS,
  formatFee,
  getErrorMessage,
  normalizeTuition,
  type Mode,
  type Tuition,
} from "@/lib/tuition";

const MODE_ICONS: Record<Mode, LucideIcon> = {
  online: Laptop,
  offline: MapPin,
  hybrid: Shuffle,
};

const gradientBtn =
  "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 transition-all hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-lg";

const inputClass =
  "border-indigo-200 bg-white/70 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30";

const textareaClass =
  "min-h-24 w-full rounded-md border border-indigo-200 bg-white/70 px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-indigo-500 focus-visible:ring-[3px] focus-visible:ring-indigo-500/30 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50";

const NOTE_MAX = 1000;

const readString = (user: unknown, key: string): string => {
  const value = (user as Record<string, unknown> | null | undefined)?.[key];
  return typeof value === "string" ? value : "";
};

/* ------------------------------------------------------------------ */
/* Apply form (shudhu student, login kora)                              */
/* ------------------------------------------------------------------ */

type ApplyErrors = Partial<Record<"preferredSchedule" | "phone" | "note" | "form", string>>;

const ApplyForm = ({
  tuitionId,
  defaultPhone,
  onApplied,
}: {
  tuitionId: string;
  defaultPhone: string;
  onApplied: () => void;
}) => {
  const [form, setForm] = useState({ preferredSchedule: "", phone: defaultPhone, note: "" });
  const [errors, setErrors] = useState<ApplyErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
  };

  const validate = () => {
    const e: ApplyErrors = {};
    const schedule = form.preferredSchedule.trim();
    const phone = form.phone.replace(/[\s-]/g, "");

    if (schedule.length < 3) e.preferredSchedule = "Preferred schedule dite hobe";
    else if (schedule.length > 100) e.preferredSchedule = "Schedule 100 character-er beshi hobe na";

    if (phone && !/^\+?\d{10,15}$/.test(phone)) e.phone = "Valid phone number din";

    if (form.note.length > NOTE_MAX) e.note = `Note ${NOTE_MAX} character-er beshi hobe na`;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || !validate()) return;

    setSubmitting(true);
    try {
      await apiFetch("/api/applications", {
        method: "POST",
        body: {
          tuitionId,
          preferredSchedule: form.preferredSchedule.trim(),
          phone: form.phone.trim(),
          note: form.note.trim(),
        },
      });
      onApplied();
    } catch (err) {
      // 409 mane age-i apply kora, tai applied state-e niye jai
      if (err instanceof ApiError && err.status === 409) {
        onApplied();
        return;
      }
      setErrors({ form: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="preferredSchedule" className="text-indigo-900">
          Preferred schedule <span className="text-pink-500">*</span>
        </Label>
        <Input
          id="preferredSchedule"
          name="preferredSchedule"
          placeholder="e.g. Sat, Mon, Wed - 5:00 PM"
          value={form.preferredSchedule}
          onChange={handleChange}
          aria-invalid={!!errors.preferredSchedule}
          disabled={submitting}
          className={inputClass}
        />
        {errors.preferredSchedule && (
          <p className="text-xs text-destructive">{errors.preferredSchedule}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="apply-phone" className="text-indigo-900">
          Phone <span className="font-normal text-slate-500">(optional)</span>
        </Label>
        <Input
          id="apply-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="01712345678"
          value={form.phone}
          onChange={handleChange}
          aria-invalid={!!errors.phone}
          disabled={submitting}
          className={inputClass}
        />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="note" className="text-indigo-900">
          Note <span className="font-normal text-slate-500">(optional)</span>
        </Label>
        <textarea
          id="note"
          name="note"
          placeholder="Tell the tutor about your goals or current level..."
          value={form.note}
          onChange={handleChange}
          aria-invalid={!!errors.note}
          disabled={submitting}
          maxLength={NOTE_MAX}
          className={textareaClass}
        />
        <div className="flex justify-between gap-2">
          <p className="text-xs text-destructive">{errors.note}</p>
          <p className="shrink-0 text-xs text-slate-500">
            {form.note.length}/{NOTE_MAX}
          </p>
        </div>
      </div>

      {errors.form && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600" role="alert">
          {errors.form}
        </p>
      )}

      <Button type="submit" disabled={submitting} className={`w-full ${gradientBtn}`}>
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Apply now"
        )}
      </Button>
    </form>
  );
};

/* ------------------------------------------------------------------ */
/* Apply panel: login / role / already-applied obostha handle kore       */
/* ------------------------------------------------------------------ */

type AppliedState = "checking" | "applied" | "open";

const StudentApply = ({ tuitionId, phone }: { tuitionId: string; phone: string }) => {
  const [state, setState] = useState<AppliedState>("checking");

  // Student age-i apply koreche kina check
  useEffect(() => {
    let cancelled = false;

    apiFetch<{ data?: unknown }>("/api/applications/student")
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const already = list.some(
          (a) => a && typeof a === "object" && String((a as { tuitionId?: unknown }).tuitionId) === tuitionId
        );
        setState(already ? "applied" : "open");
      })
      // Check fail korleo form dekhai, server-i duplicate (409) atkabe
      .catch(() => {
        if (!cancelled) setState("open");
      });

    return () => {
      cancelled = true;
    };
  }, [tuitionId]);

  if (state === "checking") {
    return (
      <div className="flex items-center justify-center py-6" role="status">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
        <span className="sr-only">Checking...</span>
      </div>
    );
  }

  if (state === "applied") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800" role="status">
        <p className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          Application submitted
        </p>
        <p className="mt-1 text-green-700">
          The tutor will review your application. You can track its status from your dashboard.
        </p>
        <Link
          href="/dashboard/student/applications"
          className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-3 border-green-300 bg-white/70 hover:bg-green-100`}
        >
          View my applications
        </Link>
      </div>
    );
  }

  return <ApplyForm tuitionId={tuitionId} defaultPhone={phone} onApplied={() => setState("applied")} />;
};

const ApplyPanel = ({ tuitionId }: { tuitionId: string }) => {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const role = getUserRole(user);

  if (isPending) {
    return <div className="h-40 animate-pulse rounded-xl bg-indigo-50" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <div className="grid gap-3">
        <p className="text-sm text-slate-600">Sign in with a student account to apply for this tuition.</p>
        <Link href={ROUTES.signIn} className={`${buttonVariants()} ${gradientBtn}`}>
          Sign in to apply
        </Link>
        <Link
          href={ROUTES.signUp}
          className={`${buttonVariants({ variant: "outline" })} border-indigo-200 hover:bg-indigo-50`}
        >
          Create an account
        </Link>
      </div>
    );
  }

  if (role !== "student") {
    return (
      <p className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-slate-600">
        Only student accounts can apply for tuitions.
      </p>
    );
  }

  return <StudentApply tuitionId={tuitionId} phone={readString(user, "phone")} />;
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type DetailsState = { key: string; tuition: Tuition | null; error: string | null; notFound: boolean };

const InfoItem = ({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent: string;
}) => (
  <div className="flex items-start gap-3 rounded-xl bg-indigo-50/50 p-3">
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent}`}>
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="break-words text-sm font-medium text-slate-900">{value}</dd>
    </div>
  </div>
);

const TuitionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<DetailsState | null>(null);

  const key = `${id}#${reloadKey}`;

  useEffect(() => {
    let cancelled = false;

    apiFetch<{ data?: unknown }>(`/api/tuitions/${id}`, { auth: false })
      .then((res) => {
        if (cancelled) return;
        const tuition = normalizeTuition(res.data);
        setState({
          key,
          tuition,
          error: tuition ? null : "Tuition not found",
          notFound: !tuition,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          key,
          tuition: null,
          error: getErrorMessage(err, "Tuition load kora jayni"),
          notFound: err instanceof ApiError && (err.status === 404 || err.status === 400),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [id, key]);

  const loading = state?.key !== key;
  const tuition = state?.tuition ?? null;

  const posted = tuition?.createdAt ? new Date(tuition.createdAt) : null;
  const postedText =
    posted && !Number.isNaN(posted.getTime())
      ? posted.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4 py-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/tuitions"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tuitions
        </Link>

        {loading ? (
          <div className="grid animate-pulse gap-6 lg:grid-cols-[1fr_360px]" aria-busy="true">
            <div className="space-y-4">
              <div className="aspect-[16/7] rounded-2xl bg-indigo-100" />
              <div className="h-8 w-3/4 rounded bg-indigo-100" />
              <div className="h-4 w-full rounded bg-indigo-50" />
              <div className="h-4 w-2/3 rounded bg-indigo-50" />
            </div>
            <div className="h-72 rounded-2xl bg-indigo-100" />
          </div>
        ) : !tuition ? (
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-white/70 p-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <GraduationCap className="h-7 w-7" />
            </span>
            <h1 className="mt-4 text-lg font-semibold text-slate-900">
              {state?.notFound ? "Tuition not found" : "Something went wrong"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {state?.notFound
                ? "This tuition may have been closed or removed."
                : state?.error}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              {!state?.notFound && (
                <Button
                  variant="outline"
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="border-indigo-200 hover:bg-indigo-50"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try again
                </Button>
              )}
              <Link href="/tuitions" className={`${buttonVariants()} ${gradientBtn}`}>
                Browse tuitions
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Main */}
            <article className="min-w-0 space-y-6">
              <div className="overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 shadow-sm">
                {tuition.bannerImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tuition.bannerImage}
                    alt={tuition.title}
                    className="aspect-[16/7] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/7] items-center justify-center text-indigo-300">
                    <GraduationCap className="h-14 w-14" />
                  </div>
                )}
              </div>

              <header>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                    {tuition.subject}
                  </span>
                  {tuition.classLevel && (
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                      {tuition.classLevel}
                    </span>
                  )}
                </div>
                <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">{tuition.title}</h1>
                <p className="mt-2 text-sm text-slate-500">
                  {tuition.tutorName && (
                    <>
                      Posted by <span className="font-medium text-slate-700">{tuition.tutorName}</span>
                    </>
                  )}
                  {tuition.tutorName && postedText && " · "}
                  {postedText}
                </p>
              </header>

              <dl className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={BookOpen}
                  label="Subject"
                  value={tuition.subject}
                  accent="bg-indigo-100 text-indigo-600"
                />
                <InfoItem
                  icon={Layers}
                  label="Class level"
                  value={tuition.classLevel || "Not specified"}
                  accent="bg-purple-100 text-purple-600"
                />
                <InfoItem
                  icon={MODE_ICONS[tuition.mode]}
                  label="Mode"
                  value={
                    tuition.mode !== "online" && tuition.location
                      ? `${MODE_LABELS[tuition.mode]} · ${tuition.location}`
                      : MODE_LABELS[tuition.mode]
                  }
                  accent="bg-pink-100 text-pink-600"
                />
                <InfoItem
                  icon={CalendarDays}
                  label="Schedule"
                  value={`${tuition.daysPerWeek} ${tuition.daysPerWeek === 1 ? "day" : "days"} per week`}
                  accent="bg-emerald-100 text-emerald-600"
                />
              </dl>

              <section className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
                <h2 className="font-semibold text-slate-900">About this tuition</h2>
                <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-slate-700">
                  {tuition.description}
                </p>
              </section>
            </article>

            {/* Apply */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-xl shadow-indigo-500/10 backdrop-blur">
                <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <div className="space-y-5 p-5">
                  <div>
                    <p className="text-sm text-slate-500">Monthly fee</p>
                    <p className="flex items-center gap-2 text-3xl font-bold text-slate-900">
                      <Wallet className="h-6 w-6 text-purple-500" />
                      {formatFee(tuition.monthlyFee)}
                    </p>
                  </div>

                  <hr className="border-indigo-100" />

                  <div>
                    <h2 className="mb-3 font-semibold text-slate-900">Apply for this tuition</h2>
                    <ApplyPanel tuitionId={tuition.id} />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default TuitionDetailsPage;