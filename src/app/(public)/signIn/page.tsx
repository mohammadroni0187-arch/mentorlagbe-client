"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";

type FormErrors = Partial<Record<"email" | "password" | "form", string>>;

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

const SignInPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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

    if (!form.email.trim()) newErrors.email = "Email dite hobe";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = "Valid email din";
    if (!form.password) newErrors.password = "Password dite hobe";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await signIn.email({
        email: form.email,
        password: form.password,
        callbackURL: "/dashboard",
      });

      if (error) {
        setErrors({ form: error.message ?? "Login fail hoyeche" });
        toast.error(error.message ?? "Sign in failed");
        return;
      }
      toast.success("Signed in successfully!");
    } catch (err) {
      console.error("Login Error:", err);
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
        callbackURL: `${window.location.origin}/dashboard`,
      });

      if (error) {
        const message = error.message ?? "Google login fail hoyeche";
        setErrors({ form: message });
        toast.error(message);
        setGoogleLoading(false);
        return;
      }
      toast.info("Redirecting to Google...");
      // success hole browser Google-e redirect hobe, tai loading on thakbe
    } catch (err) {
      console.error("Google Login Error:", err);
      const message = "Google login e somossa hoyeche, abar try korun";
      setErrors({ form: message });
      toast.error(message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
      <Card className="w-full max-w-sm overflow-hidden border-0 bg-white/80 shadow-xl shadow-indigo-500/10 backdrop-blur dark:bg-slate-900/80">
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent">
            Login to your account
          </CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Link
              href="/signUp"
              className={`${buttonVariants({ variant: "link" })} text-indigo-600 hover:text-purple-600`}
            >
              Sign Up
            </Link>
          </CardAction>
        </CardHeader>

        <form onSubmit={handleSubmit} noValidate>
          <CardContent>
            <div className="flex flex-col gap-6">
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
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-indigo-900 dark:text-indigo-200">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm text-indigo-600 underline-offset-4 hover:text-purple-600 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              {errors.form && (
                <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                  {errors.form}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="mt-6 flex-col gap-3">
            {/* submit button form-er bhitore, tai Enter chaple-o kaj korbe */}
            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 transition-all hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
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
              Sign In with Google
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignInPage;