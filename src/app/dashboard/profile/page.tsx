"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ImagePlus, Link2, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { ROUTES, type Role } from "@/lib/roles";
import { getErrorMessage, uploadToImgBB, validateImageFile } from "@/lib/tuition";

type FormErrors = Partial<Record<"name" | "phone" | "bio" | "image" | "form", string>>;
type ImageMode = "upload" | "url";

type ProfileFormProps = {
  name: string;
  email: string;
  image: string;
  phone: string;
  bio: string;
  role: Role | null;
};

const BIO_MAX = 300;

const inputClass =
  "border-indigo-200 bg-white/70 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30";

const textareaClass =
  "min-h-28 w-full rounded-md border border-indigo-200 bg-white/70 px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-indigo-500 focus-visible:ring-[3px] focus-visible:ring-indigo-500/30 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50";

const ROLE_BADGE: Record<Role, string> = {
  student: "bg-indigo-100 text-indigo-700",
  tutor: "bg-purple-100 text-purple-700",
  admin: "bg-pink-100 text-pink-700",
};

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

/** Session user-e phone/bio runtime-e thake, kintu client type-e na-o thakte pare. */
const readString = (user: unknown, key: string): string => {
  const value = (user as Record<string, unknown> | null | undefined)?.[key];
  return typeof value === "string" ? value : "";
};

/**
 * Form-er state ekhane. Parent user load hole tarpor eta render kore,
 * tai initial value useState-e diye dewa jay, useEffect lage na.
 */
const ProfileForm = ({ name, email, image, phone, bio, role }: ProfileFormProps) => {
  // Last saved value: "Save" button enable/disable ar dirty check-er jonno
  const [baseline, setBaseline] = useState({ name, phone, bio, image });

  const [form, setForm] = useState({ name, phone, bio });
  const [imageUrl, setImageUrl] = useState(image);
  const [imageMode, setImageMode] = useState<ImageMode>("upload");
  const [file, setFile] = useState<{ file: File; preview: string } | null>(null);
  const [imgBroken, setImgBroken] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const url = file?.preview;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  const touch = (field?: keyof FormErrors) => {
    setSaved(false);
    setErrors((prev) => ({ ...prev, ...(field ? { [field]: undefined } : {}), form: undefined }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name: field, value } = e.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    touch(field as keyof FormErrors);
  };

  const handleFile = (selected: File | undefined) => {
    if (!selected) return;
    const problem = validateImageFile(selected);
    if (problem) {
      setErrors((prev) => ({ ...prev, image: problem }));
      return;
    }
    setFile({ file: selected, preview: URL.createObjectURL(selected) });
    setImgBroken(false);
    touch("image");
  };

  const removePhoto = () => {
    setFile(null);
    setImageUrl("");
    setImgBroken(false);
    if (fileRef.current) fileRef.current.value = "";
    touch("image");
  };

  const validate = () => {
    const e: FormErrors = {};
    const phoneValue = form.phone.replace(/[\s-]/g, "");

    if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    else if (form.name.trim().length > 60) e.name = "Name cannot exceed 60 characters.";

    if (phoneValue && !/^\+?\d{10,15}$/.test(phoneValue))
      e.phone = "Enter a valid phone number (for example, 01712345678 or +8801712345678).";

    if (form.bio.length > BIO_MAX) e.bio = `Bio cannot exceed ${BIO_MAX} characters.`;

    if (!file && imageUrl.trim() && !isValidUrl(imageUrl.trim()))
      e.image = "Please enter a valid image URL (https://...).";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving || !validate()) return;

    setSaving(true);
    setSaved(false);
    try {
      // Notun file thakle ImgBB-te upload, noile URL (ba khali = photo remove)
      const finalImage = file ? await uploadToImgBB(file.file) : imageUrl.trim() || null;

      const payload = {
        name: form.name.trim(),
        image: finalImage,
        phone: form.phone.trim(),
        bio: form.bio.trim(),
      };

      // phone/bio custom field, tai client type-e na-o thakte pare
      const { error } = await authClient.updateUser(
        payload as Parameters<typeof authClient.updateUser>[0]
      );

      if (error) {
        setErrors({ form: error.message ?? "Could not update your profile." });
        toast.error(error.message ?? "Profile update failed");
        return;
      }

      setBaseline({
        name: payload.name,
        phone: payload.phone,
        bio: payload.bio,
        image: finalImage ?? "",
      });
      setForm({ name: payload.name, phone: payload.phone, bio: payload.bio });
      setImageUrl(finalImage ?? "");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setSaved(true);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Update Profile Error:", err);
      setErrors({ form: getErrorMessage(err) });
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const dirty =
    form.name.trim() !== baseline.name ||
    form.phone.trim() !== baseline.phone ||
    form.bio.trim() !== baseline.bio ||
    !!file ||
    imageUrl.trim() !== baseline.image;

  const previewSrc = file?.preview ?? (isValidUrl(imageUrl.trim()) ? imageUrl.trim() : "");
  const showImage = !!previewSrc && !imgBroken;
  const initial = form.name.trim().charAt(0).toUpperCase() || "U";
  const hasPhoto = !!file || !!imageUrl.trim();

  return (
    <Card className="overflow-hidden border-0 bg-white/80 shadow-xl shadow-indigo-500/10 backdrop-blur">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent">
          Update Profile
        </CardTitle>
        <CardDescription>Manage how you appear on the platform.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-6">
          {/* Identity + photo */}
          <div className="flex flex-col gap-5 rounded-xl bg-indigo-50/50 p-4 sm:flex-row sm:items-center">
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt="Profile preview"
                referrerPolicy="no-referrer"
                onError={() => setImgBroken(true)}
                className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-white"
              />
            ) : (
              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-3xl font-semibold text-white ring-4 ring-white">
                {initial}
              </span>
            )}

            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-slate-900">
                {form.name || "Your name"}
              </p>
              <p className="truncate text-sm text-slate-500">{email}</p>
              {role && (
                <span
                  className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${ROLE_BADGE[role]}`}
                >
                  {role}
                </span>
              )}
            </div>
          </div>

          {/* Profile picture */}
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-indigo-900">
                Profile picture <span className="font-normal text-slate-500">(optional)</span>
              </Label>

              <div
                role="radiogroup"
                aria-label="Profile picture source"
                className="inline-flex rounded-lg border border-indigo-200 bg-white/70 p-0.5"
              >
                {(
                  [
                    { value: "upload", label: "Upload", icon: Upload },
                    { value: "url", label: "Image URL", icon: Link2 },
                  ] as const
                ).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={imageMode === value}
                    onClick={() => setImageMode(value)}
                    disabled={saving}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      imageMode === value
                        ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow"
                        : "text-slate-600 hover:bg-indigo-50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {imageMode === "upload" ? (
              <div className="flex flex-wrap items-center gap-3">
                <label
                  htmlFor="profile-image-file"
                  className={`${buttonVariants({ variant: "outline", size: "sm" })} cursor-pointer border-indigo-200 hover:bg-indigo-50 ${
                    saving ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <ImagePlus className="mr-1.5 h-4 w-4" />
                  {file ? "Choose another" : "Choose image"}
                </label>
                <input
                  ref={fileRef}
                  id="profile-image-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  disabled={saving}
                  className="sr-only"
                />
                <span className="min-w-0 truncate text-xs text-slate-500">
                  {file
                    ? `${file.file.name} · ${(file.file.size / 1024).toFixed(0)} KB (uploads when you save)`
                    : "JPG, PNG or WEBP, up to 5MB"}
                </span>
              </div>
            ) : (
              <Input
                id="profile-image-url"
                value={file ? "" : imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImgBroken(false);
                  touch("image");
                }}
                placeholder="https://example.com/photo.jpg"
                aria-label="Profile image URL"
                aria-invalid={!!errors.image}
                disabled={saving || !!file}
                className={inputClass}
              />
            )}

            {imageMode === "url" && file && (
              <p className="text-xs text-slate-500">
                An image is selected for upload. Remove it first if you want to use a URL instead.
              </p>
            )}

            {errors.image && (
              <p className="text-xs text-destructive" role="alert">
                {errors.image}
              </p>
            )}

            {hasPhoto && (
              <button
                type="button"
                onClick={removePhoto}
                disabled={saving}
                className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove photo
              </button>
            )}
          </div>

          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-indigo-900">
              Full name
            </Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              aria-invalid={!!errors.name}
              disabled={saving}
              className={inputClass}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Email (read only) */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-indigo-900">
              Email
            </Label>
            <Input id="email" value={email} disabled readOnly className={inputClass} />
            <p className="text-xs text-slate-500">Your email address cannot be changed.</p>
          </div>

          {/* Phone */}
          <div className="grid gap-2">
            <Label htmlFor="phone" className="text-indigo-900">
              Phone <span className="font-normal text-slate-500">(optional)</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="01712345678"
              value={form.phone}
              onChange={handleChange}
              aria-invalid={!!errors.phone}
              disabled={saving}
              className={inputClass}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          {/* Bio */}
          <div className="grid gap-2">
            <Label htmlFor="bio" className="text-indigo-900">
              Bio <span className="font-normal text-slate-500">(optional)</span>
            </Label>
            <textarea
              id="bio"
              name="bio"
              placeholder="Tell others a little about yourself..."
              value={form.bio}
              onChange={handleChange}
              aria-invalid={!!errors.bio}
              disabled={saving}
              maxLength={BIO_MAX}
              className={textareaClass}
            />
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-destructive">{errors.bio}</p>
              <p className="shrink-0 text-xs text-slate-500">
                {form.bio.length}/{BIO_MAX}
              </p>
            </div>
          </div>

          {errors.form && (
            <p
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600"
              role="alert"
            >
              {errors.form}
            </p>
          )}
          {saved && (
            <p
              className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700"
              role="status"
            >
              <CheckCircle2 className="h-4 w-4" />
              Profile updated successfully.
            </p>
          )}
        </CardContent>

        <CardFooter className="mt-6">
          <Button
            type="submit"
            disabled={saving || !dirty}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

const ProfilePage = () => {
  // Kono role-er restriction nai: student, tutor, admin shobai dhukte pare
  const { user, role, isLoading } = useRoleGuard();

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Link
        href={ROUTES.dashboard}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <ProfileForm
        name={user.name ?? ""}
        email={user.email}
        image={user.image ?? ""}
        phone={readString(user, "phone")}
        bio={readString(user, "bio")}
        role={role}
      />
    </div>
  );
};

export default ProfilePage;