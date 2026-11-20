"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const gradientBtn =
  "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 transition-all hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700";

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const message = error instanceof Error ? error.message : "Something went wrong.";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4 text-center">
      <span className="rounded-full bg-pink-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-pink-600">
        Unexpected error
      </span>
      <h1 className="mt-6 text-3xl font-bold text-slate-900">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">{message}</p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button onClick={() => retry()} className={`${buttonVariants()} ${gradientBtn}`}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </button>
        <Link
          href="/"
          className={`${buttonVariants({ variant: "outline" })} border-indigo-200 bg-white/70 text-indigo-700 hover:bg-indigo-50`}
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
