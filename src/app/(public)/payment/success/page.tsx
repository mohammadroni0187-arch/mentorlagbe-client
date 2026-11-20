"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { getUserRole, ROLE_DASHBOARD, ROUTES } from "@/lib/roles";

const gradientBtn =
  "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 transition-all hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700";

function PaymentSuccessContent() {
  const params = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const [state, setState] = useState<"checking" | "success" | "error">("checking");
  const [message, setMessage] = useState("Verifying your payment...");
  const started = useRef(false);

  useEffect(() => {
    if (started.current || isPending) return;
    started.current = true;

    const sessionId = params.get("session_id");
    if (!sessionId) return;

    (async () => {
      try {
        const res = await apiFetch<{ message?: string }>(
          "/api/payments/verify-checkout-session",
          { method: "POST", body: { sessionId } }
        );
        setState("success");
        setMessage(res.message ?? "Your Pro plan is now active.");
        toast.success("Payment successful! Pro plan activated.");
      } catch (err) {
        setState("error");
        setMessage(
          err instanceof Error ? err.message : "We could not verify this payment."
        );
        toast.error("Payment verification failed.");
      }
    })();
  }, [params, isPending]);

  const sessionId = params.get("session_id");
  const viewState = sessionId ? state : "error";
  const viewMessage = sessionId
    ? message
    : "No checkout session was found in the return URL.";

  const role = getUserRole(session?.user);
  const dashboardHref = role ? ROLE_DASHBOARD[role] : ROUTES.dashboard;

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-white/60 bg-white/85 p-8 text-center shadow-xl shadow-indigo-500/10 backdrop-blur">
        <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {viewState === "checking" ? (
          <>
            <Loader2 className="mx-auto mt-8 h-10 w-10 animate-spin text-indigo-600" />
            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Confirming your payment
            </h1>
            <p className="mt-2 text-sm text-slate-600">{viewMessage}</p>
          </>
        ) : viewState === "success" ? (
          <>
            <span className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Payment successful
            </h1>
            <p className="mt-2 text-sm text-slate-600">{viewMessage}</p>
            <Link
              href={dashboardHref}
              className={`${buttonVariants()} ${gradientBtn} mt-6`}
            >
              Go to my dashboard
            </Link>
          </>
        ) : (
          <>
            <span className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <XCircle className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Could not confirm payment
            </h1>
            <p className="mt-2 text-sm text-slate-600">{viewMessage}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={ROUTES.pricing}
                className={`${buttonVariants({ variant: "outline" })} border-indigo-200 text-indigo-700 hover:bg-indigo-50`}
              >
                Back to pricing
              </Link>
              <Button
                onClick={() => {
                  started.current = false;
                  setState("checking");
                }}
                className={gradientBtn}
              >
                Try again
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
