"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Crown,
  ImagePlus,
  Info,
  Laptop,
  Loader2,
  MapPin,
  Shuffle,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, ApiError } from "@/lib/api";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { ROUTES } from "@/lib/roles";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

// Backend-er route onujayi change korben
const CREATE_ENDPOINT = "/api/tuitions";
const MY_TUITIONS_ENDPOINT = "/api/tuitions/my";

const FREE_POST_LIMIT = 2;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Mode = "online" | "offline" | "hybrid";
type Plan = "free" | "pro";

const MODES: { value: Mode; label: string; hint: string; icon: LucideIcon }[] = [
  { value: "online", label: "Online", hint: "Via video call", icon: Laptop },
  { value: "offline", label: "Offline", hint: "At home / in person", icon: MapPin },
  { value: "hybrid", label: "Hybrid", hint: "Both ways", icon: Shuffle },
];

const CLASS_LEVELS = [
  "Class 1 - 5",
  "Class 6 - 8",
  "Class 9 - 10 (SSC)",
  "Class 11 - 12 (HSC)",
  "Admission Preparation",
  "University",
  "Others",
];

const SUBJECT_SUGGESTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Bangla",
  "ICT",
  "Accounting",
  "Higher Math",
  "General Science",
];

const DAYS = [1, 2, 3, 4, 5, 6, 7];

/* ------------------------------------------------------------------ */
/* Types & helpers                                                     */
/* ------------------------------------------------------------------ */

type FormState = {
  title: string;
  subject: string;
  classLevel: string;
  mode: Mode;
  location: string;
  monthlyFee: string;
  daysPerWeek: string;
  description: string;
};

type FieldErrors = Partial<Record<keyof FormState | "banner" | "form", string>>;

type Banner = { file: File; preview: string };

const INITIAL_FORM: FormState = {
  title: "",
  subject: "",
  classLevel: "",
  mode: "online",
  location: "",
  monthlyFee: "",
  daysPerWeek: "3",
  description: "",
};

const inputClass =
  "border-indigo-200 bg-white/70 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30";

const selectClass =
  "h-9 w-full rounded-md border border-indigo-200 bg-white/70 px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-indigo-500 focus-visible:ring-[3px] focus-visible:ring-indigo-500/30 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50";

const textareaClass =
  "min-h-32 w-full rounded-md border border-indigo-200 bg-white/70 px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-indigo-500 focus-visible:ring-[3px] focus-visible:ring-indigo-500/30 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50";

const gradientBtn =
  "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 transition-all hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-lg";

const getPlan = (user: unknown): Plan => {
  const plan = (user as { plan?: unknown } | null | undefined)?.plan;
  return typeof plan === "string" && plan.toLowerCase() === "pro" ? "pro" : "free";
};

/** Backend response-er shape jai hok, tutor-er post count ber korar chesta kore. */
const extractCount = (res: unknown): number | null => {
  if (Array.isArray(res)) return res.length;
  if (res && typeof res === "object") {
    const obj = res as { data?: unknown; total?: unknown; count?: unknown };
    if (Array.isArray(obj.data)) return obj.data.length;
    if (typeof obj.total === "number") return obj.total;
    if (typeof obj.count === "number") return obj.count;
  }
  return null;
};

async function uploadToImgBB(file: File): Promise<string> {
  const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!key) {
    throw new Error("ImgBB API key set kora nai (NEXT_PUBLIC_IMGBB_API_KEY).");
  }

  const body = new FormData();
  body.append("image", file);

  let res: Response;
  try {
    res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
      method: "POST",
      body,
    });
  } catch {
    throw new Error("Image upload korte network error hoyeche.");
  }

  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    data?: { display_url?: string; url?: string };
    error?: { message?: string };
  } | null;

  const url = json?.data?.display_url ?? json?.data?.url;
  if (!res.ok || !json?.success || !url) {
    throw new Error(json?.error?.message ?? "Image upload fail hoyeche.");
  }
  return url;
}

/* ------------------------------------------------------------------ */
/* Small UI pieces                                                     */
/* ------------------------------------------------------------------ */

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  group?: boolean;
  className?: string;
  children: React.ReactNode;
};

const Field = ({ id, label, error, hint, required, group, className = "", children }: FieldProps) => (
  <div className={`grid gap-2 ${className}`} data-field-error={error ? "true" : undefined}>
    {group ? (
      <p className="text-sm font-medium text-indigo-900">
        {label}
        {required && <span className="text-pink-500"> *</span>}
      </p>
    ) : (
      <Label htmlFor={id} className="text-indigo-900">
        {label}
        {required && <span className="text-pink-500"> *</span>}
      </Label>
    )}
    {children}
    {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    {error && (
      <p className="text-xs text-destructive" role="alert">
        {error}
      </p>
    )}
  </div>
);

const Section = ({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur md:p-6">
    <header className="mb-5 flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-sm font-bold text-white shadow-md shadow-purple-500/30">
        {step}
      </span>
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </header>
    <div className="grid gap-5">{children}</div>
  </section>
);

const QuotaCard = ({
  plan,
  count,
  loading,
}: {
  plan: Plan;
  count: number | null;
  loading: boolean;
}) => {
  if (plan === "pro") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-purple-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
          <Crown className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-slate-900">Pro plan</p>
          <p className="text-sm text-slate-600">You can post unlimited tuitions.</p>
        </div>
      </div>
    );
  }

  const used = count ?? 0;
  const percent = Math.min(100, Math.round((used / FREE_POST_LIMIT) * 100));
  const reached = count !== null && count >= FREE_POST_LIMIT;

  return (
    <div className="rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">Free plan</p>
          <p className="text-sm text-slate-600">
            {loading
              ? "Checking your posts..."
              : count === null
                ? `Up to ${FREE_POST_LIMIT} tuition posts allowed.`
                : `${Math.min(used, FREE_POST_LIMIT)} of ${FREE_POST_LIMIT} posts used`}
          </p>
        </div>
        <Link
          href={ROUTES.pricing}
          className={`${buttonVariants({ size: "sm" })} ${gradientBtn}`}
        >
          <Crown className="mr-1.5 h-4 w-4" />
          Upgrade to Pro
        </Link>
      </div>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-indigo-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={FREE_POST_LIMIT}
        aria-valuenow={Math.min(used, FREE_POST_LIMIT)}
        aria-label="Free plan post usage"
      >
        <div
          className={`h-full rounded-full transition-all ${
            reached ? "bg-pink-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
          }`}
          style={{ width: loading ? "0%" : `${percent}%` }}
        />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main content                                                        */
/* ------------------------------------------------------------------ */

const PostTuitionContent = ({ plan }: { plan: Plan }) => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedTitle, setSubmittedTitle] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(plan === "free");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Free plan hole tutor-er ager post count ana
  useEffect(() => {
    if (plan !== "free") return;

    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<unknown>(MY_TUITIONS_ENDPOINT);
        if (!cancelled) setCount(extractCount(res));
      } catch {
        // count jana na gele form block korbo na, backend-i limit enforce korbe
        if (!cancelled) setCount(null);
      } finally {
        if (!cancelled) setCountLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [plan]);

  // Preview URL memory leak atkano
  useEffect(() => {
    const url = banner?.preview;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [banner]);

  const limitReached = plan === "free" && count !== null && count >= FREE_POST_LIMIT;
  const disabled = submitting || limitReached;

  const setField = <K extends keyof FormState>(name: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
  };

  const handleText = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setField(name as keyof FormState, value as never);
  };

  const handleFee = (e: React.ChangeEvent<HTMLInputElement>) => {
    setField("monthlyFee", e.target.value.replace(/\D/g, "").slice(0, 7));
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, banner: "Shudhu JPG, PNG ba WEBP image dewa jabe" }));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((prev) => ({ ...prev, banner: "Image 5MB-er choto hote hobe" }));
      return;
    }

    setBanner({ file, preview: URL.createObjectURL(file) });
    setErrors((prev) => ({ ...prev, banner: undefined, form: undefined }));
  };

  const removeBanner = () => {
    setBanner(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    const title = form.title.trim();
    const subject = form.subject.trim();
    const description = form.description.trim();
    const fee = Number(form.monthlyFee);

    if (title.length < 10) e.title = "Title kompokkhe 10 character hote hobe";
    else if (title.length > 100) e.title = "Title 100 character-er beshi hobe na";

    if (subject.length < 2) e.subject = "Subject dite hobe";

    if (!form.classLevel) e.classLevel = "Class level select korun";

    if (form.mode !== "online" && form.location.trim().length < 3)
      e.location = "Offline/Hybrid-er jonno location dite hobe";

    if (!form.monthlyFee) e.monthlyFee = "Monthly fee dite hobe";
    else if (!Number.isInteger(fee) || fee < 100) e.monthlyFee = "Fee kompokkhe 100 taka hote hobe";

    const days = Number(form.daysPerWeek);
    if (!Number.isInteger(days) || days < 1 || days > 7) e.daysPerWeek = "1 theke 7 din select korun";

    if (description.length < 30) e.description = "Description kompokkhe 30 character hote hobe";
    else if (description.length > 1000) e.description = "Description 1000 character-er beshi hobe na";

    if (!banner) e.banner = "Banner image upload korun";

    return e;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled) return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setTimeout(() => {
        document
          .querySelector("[data-field-error]")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }
    if (!banner) return;

    setSubmitting(true);
    try {
      const bannerImage = await uploadToImgBB(banner.file);

      await apiFetch(CREATE_ENDPOINT, {
        method: "POST",
        body: {
          title: form.title.trim(),
          subject: form.subject.trim(),
          classLevel: form.classLevel,
          mode: form.mode,
          location: form.mode === "online" ? "" : form.location.trim(),
          monthlyFee: Number(form.monthlyFee),
          daysPerWeek: Number(form.daysPerWeek),
          description: form.description.trim(),
          bannerImage,
          approvalStatus: "pending",
        },
      });

      setSubmittedTitle(form.title.trim());
      setCount((c) => (c === null ? c : c + 1));
      toast.success("Tuition submitted for admin approval!");
    } catch (err) {
      const message =
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Kichu ekta vul hoyeche, abar try korun";
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    removeBanner();
    setSubmittedTitle(null);
  };

  /* ---------------------------- Success view --------------------------- */
  if (submittedTitle) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-white/60 bg-white/80 p-8 text-center shadow-xl shadow-indigo-500/10 backdrop-blur">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Tuition submitted!</h2>
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-medium">&ldquo;{submittedTitle}&rdquo;</span> is now{" "}
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            pending
          </span>{" "}
          approval. It will go live once an admin approves it.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={ROUTES.dashboard}
            className={`${buttonVariants({ variant: "outline" })} border-indigo-200 hover:bg-indigo-50`}
          >
            Back to dashboard
          </Link>
          {!limitReached && (
            <Button onClick={resetForm} className={gradientBtn}>
              Post another tuition
            </Button>
          )}
        </div>
        {limitReached && (
          <p className="mt-4 text-xs text-slate-500">
            You have used all {FREE_POST_LIMIT} free posts.{" "}
            <Link href={ROUTES.pricing} className="font-medium text-indigo-600 hover:underline">
              Upgrade to Pro
            </Link>{" "}
            for unlimited posts.
          </p>
        )}
      </div>
    );
  }

  /* ------------------------------ Form view ---------------------------- */
  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6">
      <QuotaCard plan={plan} count={count} loading={countLoading} />

      {limitReached && (
        <div
          className="flex items-start gap-3 rounded-2xl border border-pink-200 bg-pink-50 p-4 text-sm text-pink-800"
          role="alert"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Free plan-e maximum {FREE_POST_LIMIT}ta tuition post kora jay ar apni sheta shesh
            korechen. Notun post korte{" "}
            <Link href={ROUTES.pricing} className="font-semibold underline">
              Pro plan-e upgrade korun
            </Link>
            .
          </p>
        </div>
      )}

      {/* 1. Basic info */}
      <Section step={1} title="Basic information" description="What are you offering?">
        <Field id="title" label="Title" required error={errors.title} hint="e.g. HSC Physics & Math, 3 days a week">
          <Input
            id="title"
            name="title"
            placeholder="Experienced tutor for HSC Physics"
            value={form.title}
            onChange={handleText}
            aria-invalid={!!errors.title}
            disabled={disabled}
            maxLength={100}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field id="subject" label="Subject" required error={errors.subject}>
            <Input
              id="subject"
              name="subject"
              list="subject-suggestions"
              placeholder="Mathematics"
              value={form.subject}
              onChange={handleText}
              aria-invalid={!!errors.subject}
              disabled={disabled}
              className={inputClass}
            />
            <datalist id="subject-suggestions">
              {SUBJECT_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>

          <Field id="classLevel" label="Class level" required error={errors.classLevel}>
            <select
              id="classLevel"
              name="classLevel"
              value={form.classLevel}
              onChange={handleText}
              aria-invalid={!!errors.classLevel}
              disabled={disabled}
              className={selectClass}
            >
              <option value="">Select class level</option>
              {CLASS_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* 2. Mode, location, fee, schedule */}
      <Section step={2} title="Mode, fee & schedule" description="How, where and how often you teach.">
        <Field id="mode" label="Mode" required group>
          <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Teaching mode">
            {MODES.map(({ value, label, hint, icon: Icon }) => (
              <label key={value} className="cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value={value}
                  checked={form.mode === value}
                  onChange={() => setField("mode", value)}
                  disabled={disabled}
                  className="peer sr-only"
                />
                <span className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-white/70 p-3 transition-all peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:ring-2 peer-checked:ring-indigo-500/30 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">{label}</span>
                    <span className="text-xs text-slate-500">{hint}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </Field>

        <Field
          id="location"
          label="Location"
          required={form.mode !== "online"}
          error={errors.location}
          hint={form.mode === "online" ? "Not needed for online tuition." : "Area and city, e.g. Dhanmondi, Dhaka"}
        >
          <Input
            id="location"
            name="location"
            placeholder={form.mode === "online" ? "Online" : "Dhanmondi, Dhaka"}
            value={form.mode === "online" ? "" : form.location}
            onChange={handleText}
            aria-invalid={!!errors.location}
            disabled={disabled || form.mode === "online"}
            className={inputClass}
          />
        </Field>

        <Field id="monthlyFee" label="Monthly fee (BDT)" required error={errors.monthlyFee}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-indigo-500">
              ৳
            </span>
            <Input
              id="monthlyFee"
              name="monthlyFee"
              inputMode="numeric"
              placeholder="3000"
              value={form.monthlyFee}
              onChange={handleFee}
              aria-invalid={!!errors.monthlyFee}
              disabled={disabled}
              className={`${inputClass} pl-8`}
            />
          </div>
        </Field>

        <Field id="daysPerWeek" label="Days per week" required group error={errors.daysPerWeek}>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Days per week">
            {DAYS.map((day) => (
              <label key={day} className="cursor-pointer">
                <input
                  type="radio"
                  name="daysPerWeek"
                  value={day}
                  checked={form.daysPerWeek === String(day)}
                  onChange={() => setField("daysPerWeek", String(day))}
                  disabled={disabled}
                  className="peer sr-only"
                />
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-200 bg-white/70 text-sm font-medium text-slate-700 transition-all peer-checked:border-transparent peer-checked:bg-gradient-to-br peer-checked:from-indigo-500 peer-checked:via-purple-500 peer-checked:to-pink-500 peer-checked:text-white peer-checked:shadow-md peer-checked:shadow-purple-500/30 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  {day}
                </span>
              </label>
            ))}
          </div>
        </Field>
      </Section>

      {/* 3. Description */}
      <Section step={3} title="Description" description="Tell students what makes this tuition a good fit.">
        <Field id="description" label="Description" required error={errors.description}>
          <textarea
            id="description"
            name="description"
            placeholder="Syllabus, teaching style, your experience, preferred timing..."
            value={form.description}
            onChange={handleText}
            aria-invalid={!!errors.description}
            disabled={disabled}
            maxLength={1000}
            className={textareaClass}
          />
          <p className="text-right text-xs text-slate-500">{form.description.length}/1000</p>
        </Field>
      </Section>

      {/* 4. Banner */}
      <Section step={4} title="Banner image" description="A clear image helps your post stand out. JPG, PNG or WEBP, up to 5MB.">
        <Field id="banner" label="Banner" required group error={errors.banner}>
          {banner ? (
            <div className="relative overflow-hidden rounded-xl border border-indigo-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.preview}
                alt="Banner preview"
                className="aspect-[16/7] w-full object-cover"
              />
              <button
                type="button"
                onClick={removeBanner}
                disabled={disabled}
                aria-label="Remove banner image"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow transition-colors hover:bg-white hover:text-red-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="truncate bg-white/90 px-3 py-1.5 text-xs text-slate-600">
                {banner.file.name} · {(banner.file.size / 1024).toFixed(0)} KB
              </p>
            </div>
          ) : (
            <label
              htmlFor="banner"
              onDragOver={(e) => {
                e.preventDefault();
                if (!disabled) setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (!disabled) handleFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
                dragging
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-indigo-200 bg-white/50 hover:border-indigo-400 hover:bg-indigo-50/50"
              } ${disabled ? "pointer-events-none opacity-50" : ""}`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <ImagePlus className="h-6 w-6" />
              </span>
              <span className="text-sm font-medium text-slate-800">
                Click to upload or drag &amp; drop
              </span>
              <span className="text-xs text-slate-500">JPG, PNG or WEBP (max 5MB)</span>
            </label>
          )}
          <input
            ref={fileInputRef}
            id="banner"
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={disabled}
            className="sr-only"
          />
        </Field>
      </Section>

      {errors.form && (
        <p
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600"
          role="alert"
        >
          {errors.form}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={ROUTES.dashboard}
          className={`${buttonVariants({ variant: "outline" })} border-indigo-200 hover:bg-indigo-50`}
        >
          Cancel
        </Link>
        <Button type="submit" disabled={disabled} className={`${gradientBtn} sm:min-w-44`}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit for approval"
          )}
        </Button>
      </div>
    </form>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const PostTuitionPage = () => {
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
      <div className="mx-auto max-w-3xl">
        <Link
          href={ROUTES.dashboard}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <header className="mb-6">
          <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
            Post a Tuition
          </h1>
          <p className="mt-2 text-slate-600">
            Fill in the details below. Your post will be reviewed by an admin before it goes live.
          </p>
        </header>

        <PostTuitionContent plan={getPlan(user)} />
      </div>
    </main>
  );
};

export default PostTuitionPage;