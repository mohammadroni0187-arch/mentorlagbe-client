import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BRAND_NAME } from "@/lib/constants";

const gradientBtn =
  "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 transition-all hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30">
        <GraduationCap className="h-8 w-8" />
      </span>
      <p className="mt-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-6xl font-extrabold text-transparent">
        404
      </p>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        The page you are looking for may have been moved, removed, or never
        existed. Let&apos;s get you back to {BRAND_NAME}.
      </p>
      <Link
        href="/"
        className={`${buttonVariants()} ${gradientBtn} mt-7`}
      >
        Back to Home
      </Link>
    </main>
  );
}
