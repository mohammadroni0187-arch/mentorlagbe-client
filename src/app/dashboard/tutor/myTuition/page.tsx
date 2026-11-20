"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  ImagePlus,
  Info,
  Laptop,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shuffle,
  Trash2,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { ROUTES } from "@/lib/roles";
import {
  CLASS_LEVELS,
  MODE_LABELS,
  SUBJECT_SUGGESTIONS,
  TUITION_ENDPOINTS,
  extractTuitions,
  formatFee,
  getErrorMessage,
  uploadToImgBB,
  validateImageFile,
  validateTuition,
  type ApprovalStatus,
  type ListingStatus,
  type Mode,
  type Tuition,
  type TuitionFormErrors,
  type TuitionFormValues,
} from "@/lib/tuition";

/* ------------------------------------------------------------------ */
/* Styles & small config                                               */
/* ------------------------------------------------------------------ */

const POST_TUITION_ROUTE = "/dashboard/tutor/post-tuition";

const inputClass =
  "border-indigo-200 bg-white/70 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30";

const selectClass =
  "h-9 w-full rounded-md border border-indigo-200 bg-white/70 px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-indigo-500 focus-visible:ring-[3px] focus-visible:ring-indigo-500/30 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50";

const textareaClass =
  "min-h-28 w-full rounded-md border border-indigo-200 bg-white/70 px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-indigo-500 focus-visible:ring-[3px] focus-visible:ring-indigo-500/30 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50";

const gradientBtn =
  "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 transition-all hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-lg";

const MODE_ICONS: Record<Mode, LucideIcon> = {
  online: Laptop,
  offline: MapPin,
  hybrid: Shuffle,
};

const APPROVAL_STYLES: Record<ApprovalStatus, { label: string; className: string; icon: LucideIcon }> = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700", icon: Clock },
  approved: { label: "Approved", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700", icon: XCircle },
};

type Filter = "all" | ApprovalStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

type Notice = { type: "success" | "error"; text: string };

/* ------------------------------------------------------------------ */
/* Generic modal                                                       */
/* ------------------------------------------------------------------ */

const Modal = ({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl ${
          wide ? "sm:max-w-2xl" : "sm:max-w-md"
        }`}
      >
        <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Edit modal                                                          */
/* ------------------------------------------------------------------ */

type EditErrors = TuitionFormErrors & { banner?: string; form?: string };

const Field = ({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="grid gap-2">
    <Label htmlFor={id} className="text-indigo-900">
      {label}
    </Label>
    {children}
    {error && (
      <p className="text-xs text-destructive" role="alert">
        {error}
      </p>
    )}
  </div>
);

const EditTuitionModal = ({
  tuition,
  onClose,
  onSaved,
}: {
  tuition: Tuition;
  onClose: () => void;
  onSaved: (id: string, fields: Partial<Tuition>) => void;
}) => {
  // Modal tuition-er jonno notun kore mount hoy, tai initial value useState-e diyei hobe
  const [form, setForm] = useState<TuitionFormValues>({
    title: tuition.title,
    subject: tuition.subject,
    classLevel: tuition.classLevel,
    mode: tuition.mode,
    location: tuition.location,
    monthlyFee: String(tuition.monthlyFee),
    daysPerWeek: String(tuition.daysPerWeek),
    description: tuition.description,
  });
  const [errors, setErrors] = useState<EditErrors>({});
  const [newBanner, setNewBanner] = useState<{ file: File; preview: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const url = newBanner?.preview;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [newBanner]);

  const setField = <K extends keyof TuitionFormValues>(name: K, value: TuitionFormValues[K]) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
  };

  const handleText = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setField(e.target.name as keyof TuitionFormValues, e.target.value as never);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      setErrors((prev) => ({ ...prev, banner: problem }));
      return;
    }
    setNewBanner({ file, preview: URL.createObjectURL(file) });
    setErrors((prev) => ({ ...prev, banner: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;

    const found = validateTuition(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setSaving(true);
    try {
      let bannerImage = tuition.bannerImage;
      if (newBanner) bannerImage = await uploadToImgBB(newBanner.file);

      const fields = {
        title: form.title.trim(),
        subject: form.subject.trim(),
        classLevel: form.classLevel,
        mode: form.mode,
        location: form.mode === "online" ? "" : form.location.trim(),
        monthlyFee: Number(form.monthlyFee),
        daysPerWeek: Number(form.daysPerWeek),
        description: form.description.trim(),
        ...(bannerImage ? { bannerImage } : {}),
      };

      await apiFetch(TUITION_ENDPOINTS.update(tuition.id), { method: "PATCH", body: fields });
      onSaved(tuition.id, fields);
    } catch (err) {
      setErrors({ form: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const bannerSrc = newBanner?.preview ?? tuition.bannerImage;

  return (
    <Modal title="Edit tuition" onClose={saving ? () => {} : onClose} wide>
      <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="grid gap-4 overflow-y-auto px-5 pb-4 pt-2">
          <Field id="edit-title" label="Title" error={errors.title}>
            <Input
              id="edit-title"
              name="title"
              value={form.title}
              onChange={handleText}
              aria-invalid={!!errors.title}
              disabled={saving}
              maxLength={100}
              className={inputClass}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="edit-subject" label="Subject" error={errors.subject}>
              <Input
                id="edit-subject"
                name="subject"
                list="edit-subject-suggestions"
                value={form.subject}
                onChange={handleText}
                aria-invalid={!!errors.subject}
                disabled={saving}
                className={inputClass}
              />
              <datalist id="edit-subject-suggestions">
                {SUBJECT_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>

            <Field id="edit-classLevel" label="Class level" error={errors.classLevel}>
              <select
                id="edit-classLevel"
                name="classLevel"
                value={form.classLevel}
                onChange={handleText}
                aria-invalid={!!errors.classLevel}
                disabled={saving}
                className={selectClass}
              >
                <option value="">Select class level</option>
                {CLASS_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
                {/* Ager data-r class level list-e na thakle-o jate hariye na jay */}
                {form.classLevel && !CLASS_LEVELS.includes(form.classLevel) && (
                  <option value={form.classLevel}>{form.classLevel}</option>
                )}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="edit-mode" label="Mode">
              <select
                id="edit-mode"
                name="mode"
                value={form.mode}
                onChange={handleText}
                disabled={saving}
                className={selectClass}
              >
                {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
                  <option key={m} value={m}>
                    {MODE_LABELS[m]}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="edit-location" label="Location" error={errors.location}>
              <Input
                id="edit-location"
                name="location"
                placeholder={form.mode === "online" ? "Not needed for online" : "Dhanmondi, Dhaka"}
                value={form.mode === "online" ? "" : form.location}
                onChange={handleText}
                aria-invalid={!!errors.location}
                disabled={saving || form.mode === "online"}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="edit-fee" label="Monthly fee (BDT)" error={errors.monthlyFee}>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-indigo-500">
                  ৳
                </span>
                <Input
                  id="edit-fee"
                  name="monthlyFee"
                  inputMode="numeric"
                  value={form.monthlyFee}
                  onChange={(e) => setField("monthlyFee", e.target.value.replace(/\D/g, "").slice(0, 7))}
                  aria-invalid={!!errors.monthlyFee}
                  disabled={saving}
                  className={`${inputClass} pl-8`}
                />
              </div>
            </Field>

            <Field id="edit-days" label="Days per week" error={errors.daysPerWeek}>
              <select
                id="edit-days"
                name="daysPerWeek"
                value={form.daysPerWeek}
                onChange={handleText}
                aria-invalid={!!errors.daysPerWeek}
                disabled={saving}
                className={selectClass}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 1 ? "day" : "days"} / week
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field id="edit-description" label="Description" error={errors.description}>
            <textarea
              id="edit-description"
              name="description"
              value={form.description}
              onChange={handleText}
              aria-invalid={!!errors.description}
              disabled={saving}
              maxLength={1000}
              className={textareaClass}
            />
            <p className="text-right text-xs text-slate-500">{form.description.length}/1000</p>
          </Field>

          <Field id="edit-banner" label="Banner image" error={errors.banner}>
            <div className="flex items-center gap-3">
              {bannerSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bannerSrc}
                  alt="Banner"
                  className="h-16 w-28 rounded-lg border border-indigo-100 object-cover"
                />
              ) : (
                <span className="flex h-16 w-28 items-center justify-center rounded-lg bg-indigo-50 text-indigo-300">
                  <ImagePlus className="h-6 w-6" />
                </span>
              )}
              <label
                htmlFor="edit-banner"
                className={`${buttonVariants({ variant: "outline", size: "sm" })} cursor-pointer border-indigo-200 hover:bg-indigo-50 ${
                  saving ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <ImagePlus className="mr-1.5 h-4 w-4" />
                {bannerSrc ? "Change image" : "Upload image"}
              </label>
              <input
                ref={fileRef}
                id="edit-banner"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
                disabled={saving}
                className="sr-only"
              />
            </div>
          </Field>

          {errors.form && (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600" role="alert">
              {errors.form}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-indigo-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="border-indigo-200 hover:bg-indigo-50"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className={gradientBtn}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

const StatusSwitch = ({
  status,
  busy,
  onToggle,
}: {
  status: ListingStatus;
  busy: boolean;
  onToggle: () => void;
}) => {
  const active = status === "active";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={active ? "Active. Click to close this tuition" : "Closed. Click to reopen this tuition"}
      onClick={onToggle}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-full py-1 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60"
    >
      <span
        className={`relative inline-block h-5 w-9 rounded-full transition-colors ${
          active ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            active ? "translate-x-4" : ""
          }`}
        />
      </span>
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : active ? "Active" : "Closed"}
    </button>
  );
};

const TuitionCard = ({
  tuition,
  busy,
  onEdit,
  onDelete,
  onToggle,
}: {
  tuition: Tuition;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) => {
  const approval = APPROVAL_STYLES[tuition.approvalStatus];
  const ApprovalIcon = approval.icon;
  const ModeIcon = MODE_ICONS[tuition.mode];
  const closed = tuition.status === "closed";

  const posted = tuition.createdAt ? new Date(tuition.createdAt) : null;
  const postedText =
    posted && !Number.isNaN(posted.getTime())
      ? posted.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : null;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10">
      <div className="relative aspect-[16/8] bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        {tuition.bannerImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tuition.bannerImage}
            alt=""
            className={`h-full w-full object-cover ${closed ? "grayscale" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-indigo-300">
            <GraduationCap className="h-10 w-10" />
          </div>
        )}
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${approval.className}`}
        >
          <ApprovalIcon className="h-3.5 w-3.5" />
          {approval.label}
        </span>
        {closed && (
          <span className="absolute right-3 top-3 rounded-full bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-white">
            Closed
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 font-semibold text-slate-900">{tuition.title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {tuition.subject}
            {tuition.classLevel && ` · ${tuition.classLevel}`}
          </p>
        </div>

        <ul className="grid gap-1.5 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <ModeIcon className="h-4 w-4 shrink-0 text-indigo-500" />
            <span className="truncate">
              {MODE_LABELS[tuition.mode]}
              {tuition.mode !== "online" && tuition.location && ` · ${tuition.location}`}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Wallet className="h-4 w-4 shrink-0 text-purple-500" />
            {formatFee(tuition.monthlyFee)} / month
          </li>
          <li className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-pink-500" />
            {tuition.daysPerWeek} {tuition.daysPerWeek === 1 ? "day" : "days"} / week
          </li>
        </ul>

        {tuition.approvalStatus === "rejected" && (
          <p className="flex items-start gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {tuition.rejectionReason || "This post was rejected by an admin. Edit it and try again."}
          </p>
        )}
        {tuition.approvalStatus === "pending" && (
          <p className="text-xs text-slate-500">Waiting for admin approval before it goes live.</p>
        )}
        {postedText && <p className="text-xs text-slate-400">Posted {postedText}</p>}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-indigo-100 pt-3">
          <StatusSwitch status={tuition.status} busy={busy} onToggle={onToggle} />
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              disabled={busy}
              className="border-indigo-200 hover:bg-indigo-50"
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={busy}
              aria-label={`Delete ${tuition.title}`}
              className="text-slate-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};

/* ------------------------------------------------------------------ */
/* Page content                                                        */
/* ------------------------------------------------------------------ */

const SkeletonCard = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-white/60 bg-white/80">
    <div className="aspect-[16/8] bg-indigo-100" />
    <div className="space-y-3 p-4">
      <div className="h-4 w-3/4 rounded bg-indigo-100" />
      <div className="h-3 w-1/2 rounded bg-indigo-50" />
      <div className="h-3 w-2/3 rounded bg-indigo-50" />
      <div className="h-8 w-full rounded bg-indigo-50" />
    </div>
  </div>
);

const MyTuitionsContent = () => {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [editing, setEditing] = useState<Tuition | null>(null);
  const [deleting, setDeleting] = useState<Tuition | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // List load (reloadKey bodlale abar fetch hoy)
  useEffect(() => {
    let cancelled = false;

    apiFetch<unknown>(TUITION_ENDPOINTS.list)
      .then((res) => {
        if (cancelled) return;
        setTuitions(extractTuitions(res));
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getErrorMessage(err, "Tuition list load kora jayni"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const notify = (type: Notice["type"], text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const retry = () => {
    setLoading(true);
    setLoadError(null);
    setReloadKey((k) => k + 1);
  };

  const closeEdit = useCallback(() => setEditing(null), []);
  const closeDelete = useCallback(() => {
    if (!deleteBusy) setDeleting(null);
  }, [deleteBusy]);

  const handleToggle = async (tuition: Tuition) => {
    const next: ListingStatus = tuition.status === "active" ? "closed" : "active";
    setBusyId(tuition.id);
    try {
      await apiFetch(TUITION_ENDPOINTS.status(tuition.id), {
        method: "PATCH",
        body: { isActive: next === "active" },
      });
      setTuitions((list) => list.map((t) => (t.id === tuition.id ? { ...t, status: next } : t)));
      notify("success", next === "closed" ? "Tuition closed." : "Tuition is active again.");
    } catch (err) {
      notify("error", getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await apiFetch(TUITION_ENDPOINTS.remove(deleting.id), { method: "DELETE" });
      setTuitions((list) => list.filter((t) => t.id !== deleting.id));
      notify("success", "Tuition deleted.");
      setDeleting(null);
    } catch (err) {
      notify("error", getErrorMessage(err));
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleSaved = (id: string, fields: Partial<Tuition>) => {
    setTuitions((list) => list.map((t) => (t.id === id ? { ...t, ...fields } : t)));
    setEditing(null);
    notify("success", "Tuition updated.");
    // Server-er asol state (jemon edit-er por approvalStatus change hole) sync korte background refetch
    setReloadKey((k) => k + 1);
  };

  const counts: Record<Filter, number> = {
    all: tuitions.length,
    pending: tuitions.filter((t) => t.approvalStatus === "pending").length,
    approved: tuitions.filter((t) => t.approvalStatus === "approved").length,
    rejected: tuitions.filter((t) => t.approvalStatus === "rejected").length,
  };

  const q = query.trim().toLowerCase();
  const visible = tuitions.filter(
    (t) =>
      (filter === "all" || t.approvalStatus === filter) &&
      (!q || t.title.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q))
  );

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by approval status">
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

        <div className="relative md:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or subject"
            aria-label="Search tuitions"
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      {/* Notice */}
      {notice && (
        <p
          role="status"
          className={`mt-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${
            notice.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <Info className="h-4 w-4 shrink-0" />
          )}
          {notice.text}
        </p>
      )}

      {/* Body */}
      <div className="mt-6">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
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
        ) : tuitions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-white/60 p-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <GraduationCap className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No tuitions yet</h2>
            <p className="mt-1 text-sm text-slate-600">Create your first post to start reaching students.</p>
            <Link href={POST_TUITION_ROUTE} className={`${buttonVariants()} ${gradientBtn} mt-5`}>
              <Plus className="mr-1.5 h-4 w-4" />
              Post a Tuition
            </Link>
          </div>
        ) : visible.length === 0 ? (
          <p className="rounded-2xl border border-indigo-100 bg-white/60 p-8 text-center text-sm text-slate-600">
            No tuitions match your filter.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((t) => (
              <TuitionCard
                key={t.id}
                tuition={t}
                busy={busyId === t.id}
                onEdit={() => setEditing(t)}
                onDelete={() => setDeleting(t)}
                onToggle={() => handleToggle(t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit modal: key diye tuition bodlale form fresh mount hoy */}
      {editing && (
        <EditTuitionModal key={editing.id} tuition={editing} onClose={closeEdit} onSaved={handleSaved} />
      )}

      {/* Delete confirm */}
      {deleting && (
        <Modal title="Delete this tuition?" onClose={closeDelete}>
          <div className="px-5 pb-5 pt-1">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">&ldquo;{deleting.title}&rdquo;</span> will be
              permanently removed. This cannot be undone.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={closeDelete}
                disabled={deleteBusy}
                className="border-indigo-200 hover:bg-indigo-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleteBusy}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {deleteBusy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const MyTuitionPage = () => {
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

        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
              My Tuitions
            </h1>
            <p className="mt-2 text-slate-600">
              Manage the tuitions you have posted: edit, close or delete them.
            </p>
          </div>
          <Link href={POST_TUITION_ROUTE} className={`${buttonVariants()} ${gradientBtn}`}>
            <Plus className="mr-1.5 h-4 w-4" />
            Post a Tuition
          </Link>
        </header>

        <MyTuitionsContent />
      </div>
    </main>
  );
};

export default MyTuitionPage;