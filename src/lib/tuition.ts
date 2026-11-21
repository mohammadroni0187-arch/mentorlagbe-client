import { ApiError } from "@/lib/api";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Mode = "online" | "offline" | "hybrid";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ListingStatus = "active" | "closed";

export type Tuition = {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: Mode;
  location: string;
  monthlyFee: number;
  daysPerWeek: number;
  description: string;
  bannerImage: string;
  tutorId?: string;
  tutorName?: string;
  tutorEmail?: string;
  approvalStatus: ApprovalStatus;
  status: ListingStatus;
  rejectionReason: string;
  createdAt: string;
};

export type TuitionFormValues = {
  title: string;
  subject: string;
  classLevel: string;
  mode: Mode;
  location: string;
  monthlyFee: string;
  daysPerWeek: string;
  description: string;
};

export type TuitionFormErrors = Partial<Record<keyof TuitionFormValues, string>>;

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

// Backend-er route onujayi ekhane change korlei hobe
export const TUITION_ENDPOINTS = {
  list: "/api/tuitions/my",
  update: (id: string) => `/api/tuitions/${id}`,
  remove: (id: string) => `/api/tuitions/${id}`,
  status: (id: string) => `/api/tuitions/${id}/status`,
};

export const CLASS_LEVELS = [
  "Class 1 - 5",
  "Class 6 - 8",
  "Class 9 - 10 (SSC)",
  "Class 11 - 12 (HSC)",
  "Admission Preparation",
  "University",
  "Others",
];

export const SUBJECT_SUGGESTIONS = [
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

export const MODE_LABELS: Record<Mode, string> = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
};

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/* ------------------------------------------------------------------ */
/* Response normalising                                                */
/* ------------------------------------------------------------------ */

const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/** Backend-er raw document (`_id` ba `id`) ke ekta stable Tuition object-e convert kore. */
export function normalizeTuition(raw: unknown): Tuition | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const id = r._id ?? r.id;
  if (typeof id !== "string" && typeof id !== "number") return null;

  return {
    id: String(id),
    title: str(r.title),
    subject: str(r.subject),
    classLevel: str(r.classLevel),
    mode: r.mode === "offline" || r.mode === "hybrid" ? r.mode : "online",
    location: str(r.location),
    monthlyFee: num(r.monthlyFee),
    daysPerWeek: num(r.daysPerWeek, 1),
    description: str(r.description),
    bannerImage: str(r.bannerImage),
    tutorId: r.tutorId === undefined ? undefined : String(r.tutorId),
    tutorName: str(r.tutorName),
    tutorEmail: str(r.tutorEmail),
    approvalStatus:
      r.approvalStatus === "approved" || r.approvalStatus === "rejected"
        ? r.approvalStatus
        : "pending",
    // Backend `isActive` (boolean) rakhe, tai oita theke status ber kori
    status: r.isActive === false || r.status === "closed" ? "closed" : "active",
    rejectionReason: str(r.rejectionReason),
    createdAt: str(r.createdAt),
  };
}

/** Response array ba `{ data: [...] }` jai hok, Tuition list ber kore. */
export function extractTuitions(res: unknown): Tuition[] {
  let list: unknown[] = [];
  if (Array.isArray(res)) list = res;
  else if (res && typeof res === "object" && Array.isArray((res as { data?: unknown }).data))
    list = (res as { data: unknown[] }).data;

  return list.map(normalizeTuition).filter((t): t is Tuition => t !== null);
}

export const formatFee = (amount: number) => `৳${amount.toLocaleString("en-US")}`;

export const getErrorMessage = (err: unknown, fallback = "Something went wrong. Please try again.") =>
  err instanceof ApiError || err instanceof Error ? err.message : fallback;

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export function validateTuition(form: TuitionFormValues): TuitionFormErrors {
  const e: TuitionFormErrors = {};
  const title = form.title.trim();
  const description = form.description.trim();
  const fee = Number(form.monthlyFee);
  const days = Number(form.daysPerWeek);

  if (title.length < 10) e.title = "Title must be at least 10 characters.";
  else if (title.length > 100) e.title = "Title cannot exceed 100 characters.";

  if (form.subject.trim().length < 2) e.subject = "Please enter a subject.";
  if (!form.classLevel) e.classLevel = "Please select a class level.";

  if (form.mode !== "online" && form.location.trim().length < 3)
    e.location = "Please enter a location for offline or hybrid tuitions.";

  if (!form.monthlyFee) e.monthlyFee = "Please enter a monthly fee.";
  else if (!Number.isInteger(fee) || fee < 100) e.monthlyFee = "Monthly fee must be at least 100 taka.";

  if (!Number.isInteger(days) || days < 1 || days > 7) e.daysPerWeek = "Please select between 1 and 7 days per week.";

  if (description.length < 30) e.description = "Description must be at least 30 characters.";
  else if (description.length > 1000) e.description = "Description cannot exceed 1000 characters.";

  return e;
}

/** Valid hole null, noile error message. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Only JPG, PNG or WEBP images are allowed.";
  if (file.size > MAX_IMAGE_SIZE) return "Image must be smaller than 5MB.";
  return null;
}

/* ------------------------------------------------------------------ */
/* ImgBB upload                                                        */
/* ------------------------------------------------------------------ */

export async function uploadToImgBB(file: File): Promise<string> {
  const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!key) throw new Error("Image upload is not configured. Please contact support.");

  const body = new FormData();
  body.append("image", file);

  let res: Response;
  try {
    res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: "POST", body });
  } catch {
    throw new Error("A network error occurred while uploading the image.");
  }

  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    data?: { display_url?: string; url?: string };
    error?: { message?: string };
  } | null;

  const url = json?.data?.display_url ?? json?.data?.url;
  if (!res.ok || !json?.success || !url) {
    throw new Error("Image upload failed. Please try again.");
  }
  return url;
}