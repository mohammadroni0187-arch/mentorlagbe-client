"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Upload, Camera } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { ROUTES, type Role } from "@/lib/roles";

type FormErrors = Partial<Record<"name" | "phone" | "bio" | "image" | "form", string>>;

type ProfileFormProps = {
  name: string;
  email: string;
  image: string;
  phone: string;
  bio: string;
  role: Role | null;
  onSuccess?: () => void;
};

const inputClass =
  "border-indigo-200 bg-white/70 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30";

const textareaClass =
  "min-h-24 w-full rounded-md border border-indigo-200 bg-white/70 px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-indigo-500 focus-visible:ring-[3px] focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50";

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

async function uploadImageFile(file: File): Promise<string> {
  const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (key) {
    const body = new FormData();
    body.append("image", file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
      method: "POST",
      body,
    });
    const json = await res.json().catch(() => null);
    const url = json?.data?.display_url ?? json?.data?.url;
    if (res.ok && json?.success && url) {
      return url;
    }
  }

  // Fallback to server route
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await apiFetch<{ data?: { image?: string }; image?: string }>(
          "/api/profile/upload-image",
          {
            method: "POST",
            body: { image: base64 },
          }
        );
        const imgUrl = res?.data?.image ?? res?.image;
        if (!imgUrl) throw new Error("Image upload response invalid");
        resolve(imgUrl);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsDataURL(file);
  });
}

const ProfileForm = ({
  name,
  email,
  image,
  phone,
  bio,
  role,
  onSuccess,
}: ProfileFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name, image, phone, bio });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name: field, value } = e.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
    setSaved(false);
    if (field === "image") setImgBroken(false);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please select a valid image file" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image must be less than 5MB" }));
      return;
    }

    try {
      setUploadingImage(true);
      setErrors((prev) => ({ ...prev, image: undefined }));
      const uploadedUrl = await uploadImageFile(file);
      setForm((prev) => ({ ...prev, image: uploadedUrl }));
      setImgBroken(false);
      toast.success("Profile image uploaded successfully via ImgBB!");
    } catch (err) {
      console.error("Upload error:", err);
      setErrors((prev) => ({
        ...prev,
        image: err instanceof Error ? err.message : "Failed to upload image",
      }));
      toast.error("Failed to upload image. You can also paste an image URL.");
    } finally {
      setUploadingImage(false);
    }
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (form.image.trim() && !isValidUrl(form.image.trim()))
      newErrors.image = "Please enter a valid image URL (https://...)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSaved(false);
    try {
      // 1. Update BetterAuth session user
      await authClient.updateUser({
        name: form.name.trim(),
        image: form.image.trim() || null,
      });

      // 2. Update extended MongoDB profile (phone, bio, name, image)
      await apiFetch("/api/profile", {
        method: "PATCH",
        body: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          bio: form.bio.trim(),
          image: form.image.trim(),
        },
      });

      setSaved(true);
      toast.success("Profile updated successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Update Profile Error:", err);
      setErrors({ form: "Something went wrong. Please try again." });
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = form.image.trim();
  const showImage = previewUrl && isValidUrl(previewUrl) && !imgBroken;
  const initial = form.name.trim().charAt(0).toUpperCase() || "U";

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
        <CardContent className="space-y-5">
          {/* Avatar preview & Upload */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-20 w-20 shrink-0">
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  referrerPolicy="no-referrer"
                  onError={() => setImgBroken(true)}
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-indigo-100"
                />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-2xl font-semibold text-white">
                  {initial}
                </span>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{form.name || "Your name"}</p>
                <p className="truncate text-sm text-slate-500">{email}</p>
                {role && (
                  <span className="mt-1 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-indigo-700">
                    {role}
                  </span>
                )}
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingImage || saving}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Uploading to ImgBB...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-3.5 w-3.5" />
                      Upload Picture (ImgBB)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Full Name */}
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
            <p className="text-xs text-slate-500">Email address cannot be changed.</p>
          </div>

          {/* Phone */}
          <div className="grid gap-2">
            <Label htmlFor="phone" className="text-indigo-900">
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+880 1712-345678"
              value={form.phone}
              onChange={handleChange}
              disabled={saving}
              className={inputClass}
            />
          </div>

          {/* Bio */}
          <div className="grid gap-2">
            <Label htmlFor="bio" className="text-indigo-900">
              Bio / About You
            </Label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              placeholder="Tell students and tutors a bit about your background, subjects, and experience..."
              value={form.bio}
              onChange={handleChange}
              disabled={saving}
              className={textareaClass}
            />
          </div>

          {/* Image URL fallback */}
          <div className="grid gap-2">
            <Label htmlFor="image" className="text-indigo-900">
              Profile Image URL (or upload above)
            </Label>
            <Input
              id="image"
              name="image"
              placeholder="https://example.com/photo.jpg"
              value={form.image}
              onChange={handleChange}
              aria-invalid={!!errors.image}
              disabled={saving}
              className={inputClass}
            />
            {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
          </div>

          {errors.form && (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
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
            disabled={saving || uploadingImage}
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
  const { user, role, isLoading } = useRoleGuard();
  const [profileData, setProfileData] = useState<{
    phone?: string;
    bio?: string;
    image?: string;
    name?: string;
  } | null>(null);
  const [fetching, setFetching] = useState(true);

  const fetchProfile = async () => {
    try {
      setFetching(true);
      const res = await apiFetch<{
        success?: boolean;
        data?: { phone?: string; bio?: string; image?: string; name?: string };
      }>("/api/profile");
      if (res?.data) {
        setProfileData(res.data);
      }
    } catch {
      // Ignore fallback to session user
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (isLoading || !user || fetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="sr-only">Loading profile...</span>
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
        name={profileData?.name ?? user.name ?? ""}
        email={user.email}
        image={profileData?.image ?? user.image ?? ""}
        phone={profileData?.phone ?? ""}
        bio={profileData?.bio ?? ""}
        role={role}
        onSuccess={fetchProfile}
      />
    </div>
  );
};

export default ProfilePage;