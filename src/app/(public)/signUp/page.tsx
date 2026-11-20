"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react";
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
import { signIn, signUp } from "@/lib/auth-client";

type FormErrors = Partial<
  Record<"name" | "email" | "password" | "confirmPassword" | "form", string>
>;

const inputClass =
  "border-indigo-200 bg-white/70 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30 dark:border-indigo-900 dark:bg-slate-900/60";

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
    />
  </svg>
);

const SignUpPage = () => {
  const router = useRouter();
  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: "student" | "tutor";
  }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const busy = loading || googleLoading;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
  };

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) newErrors.name = "Name dite hobe";
    if (!form.email.trim()) newErrors.email = "Email dite hobe";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = "Valid email din";
    if (form.password.length < 8)
      newErrors.password = "Password kompokkhe 8 character hote hobe";
    if (form.confirmPassword !== form.password)
      newErrors.confirmPassword = "Password mile nai";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await signUp.email({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        role: form.role,
        callbackURL: "/dashboard",
      });

      if (error) {
        setErrors({ form: error.message ?? "Sign up fail hoyeche" });
        toast.error(error.message ?? "Registration failed");
        return;
      }

      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Signup Error:", err);
      setErrors({ form: "Kichu ekta vul hoyeche, abar try korun" });
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signIn.social({
        provider: "google",
        callbackURL: "http://localhost:3000/dashboard",
      });

      if (error) {
        setErrors({ form: error.message ?? "Google sign up fail hoyeche" });
        setGoogleLoading(false);
      }
      // success hole browser Google-e redirect hobe, tai loading on thakbe
    } catch (err) {
      console.error("Google Signup Error:", err);
      setErrors({ form: "Google sign up e somossa hoyeche, abar try korun" });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
      <Card className="w-full max-w-md overflow-hidden border-0 bg-white/80 shadow-xl shadow-indigo-500/10 backdrop-blur dark:bg-slate-900/80">
        {/* colored top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <CardHeader className="space-y-1 text-center">
          <CardTitle className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent">
            Create an account
          </CardTitle>
          <CardDescription>Enter your details below to get started</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-5">
            {/* Role Selection */}
            <div className="grid gap-2">
              <Label className="text-indigo-900 dark:text-indigo-200">
                I want to join as
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: "student" }))}
                  disabled={busy}
                  className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${
                    form.role === "student"
                      ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-sm ring-1 ring-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300"
                      : "border-indigo-200 bg-white/70 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-indigo-900 dark:bg-slate-900/60 dark:text-slate-400"
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: "tutor" }))}
                  disabled={busy}
                  className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${
                    form.role === "tutor"
                      ? "border-purple-600 bg-purple-50/80 text-purple-700 shadow-sm ring-1 ring-purple-600 dark:bg-purple-950/50 dark:text-purple-300"
                      : "border-indigo-200 bg-white/70 text-slate-600 hover:border-purple-300 hover:bg-purple-50/40 dark:border-indigo-900 dark:bg-slate-900/60 dark:text-slate-400"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  Tutor
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-indigo-900 dark:text-indigo-200">
                Full name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                aria-invalid={!!errors.name}
                disabled={busy}
                className={inputClass}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-indigo-900 dark:text-indigo-200">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                value={form.email}
                onChange={handleChange}
                aria-invalid={!!errors.email}
                disabled={busy}
                className={inputClass}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-indigo-900 dark:text-indigo-200">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  aria-invalid={!!errors.password}
                  disabled={busy}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-3 flex items-center text-indigo-400 transition-colors hover:text-indigo-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-indigo-900 dark:text-indigo-200">
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  aria-invalid={!!errors.confirmPassword}
                  disabled={busy}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute inset-y-0 right-3 flex items-center text-indigo-400 transition-colors hover:text-indigo-600"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.form && (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                {errors.form}
              </p>
            )}
          </CardContent>

          <CardFooter className="mt-6 flex-col gap-3">
            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 transition-all hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>

            <div className="flex w-full items-center gap-3">
              <span className="h-px flex-1 bg-indigo-200 dark:bg-indigo-900" />
              <span className="text-xs uppercase text-muted-foreground">or</span>
              <span className="h-px flex-1 bg-indigo-200 dark:bg-indigo-900" />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogle}
              disabled={busy}
              className="w-full border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900 dark:hover:bg-indigo-950"
            >
              {googleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Sign up with Google
            </Button>

            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/signIn"
                className="font-medium text-indigo-600 underline-offset-4 hover:text-purple-600 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignUpPage;