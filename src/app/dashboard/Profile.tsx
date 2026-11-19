"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
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
import { authClient } from "@/lib/auth-client";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { ROUTES, type Role } from "@/lib/roles";

type FormErrors = Partial<Record<"name" | "image" | "form", string>>;

type ProfileFormProps = {
  name: string;
  email: string;
  image: string;
  role: Role | null;
};

const inputClass =
  "border-indigo-200 bg-white/70 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30";

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Form-er state ekhane. Parent user load hole tarpor eta render kore,
 * tai initial value useState-e diye dewa jay, useEffect lage na.
 */
const ProfileForm = ({ name, email, image, role }: ProfileFormProps) => {
  const [form, setForm] = useState({ name, image });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: field, value } = e.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
    setSaved(false);
    if (field === "image") setImgBroken(false);
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Name dite hobe";
    if (form.image.trim() && !isValidUrl(form.image.trim()))
      newErrors.image = "Valid image URL din (https://...)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSaved(false);
    try {
      const { error } = await authClient.updateUser({
        name: form.name.trim(),
        image: form.image.trim() || null,
      });

      if (error) {
        setErrors({ form: error.message ?? "Profile update hoyni" });
        return;
      }
      setSaved(true);
    } catch (err) {
      console.error("Update Profile Error:", err);
      setErrors({ form: "Kichu ekta vul hoyeche, abar try korun" });
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
          {/* Avatar preview */}
          <div className="flex items-center gap-4">
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
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">{form.name || "Your name"}</p>
              <p className="truncate text-sm text-slate-500">{email}</p>
              {role && (
                <span className="mt-1 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-indigo-700">
                  {role}
                </span>
              )}
            </div>
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
            <p className="text-xs text-slate-500">Email change kora jay na.</p>
          </div>

          {/* Image URL */}
          <div className="grid gap-2">
            <Label htmlFor="image" className="text-indigo-900">
              Profile image URL
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
            disabled={saving}
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
  // Kono role-er restriction nai, shudhu login thakte hobe
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
        role={role}
      />
    </div>
  );
};

export default ProfilePage;