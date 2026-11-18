"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import { authClient, signUp } from "@/lib/auth-client";

type FormErrors = Partial<
  Record<"name" | "email" | "password" | "confirmPassword" | "form", string>
>;

const inputClass =
  "border-indigo-200 bg-white/70 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30 dark:border-indigo-900 dark:bg-slate-900/60";

const SignUpPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role:"student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);


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
      const { data, error } = await signUp.email({
              name: form.name.trim(),
              email: form.email,
              password: form.password,
              role: form.role,
              callbackURL: "/dashboard",
            });
      if (error) {
        setErrors({ form: error.message ?? "Sign up fail hoyeche" });
        return;
      }

      console.log("Signup Success:", data);
    } catch (err) {
      console.error("Signup Error:", err);
      setErrors({ form: "Kichu ekta vul hoyeche, abar try korun" });
    } finally {
      setLoading(false);
    }
    const { data: tokenData, error } = await authClient.token();

    console.log("JWT Token:", tokenData);
    console.log("Token Error:", error);
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
                disabled={loading}
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
                disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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

              {/* Account Role */}
              <div className="grid gap-2">
                <Label htmlFor="role" className="text-indigo-900 dark:text-indigo-200">
                  I want to join as
                </Label>

                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  disabled={loading}
                  className={`${inputClass} h-10 w-full rounded-md border px-3 text-sm`}
                >
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                </select>
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
              disabled={loading}
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
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-indigo-600 underline-offset-4 hover:text-purple-600 hover:underline"
              >
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignUpPage;