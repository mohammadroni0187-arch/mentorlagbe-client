
"use client";

import { Loader2 } from "lucide-react";
import { useRoleGuard } from "@/hooks/use-role-guard";
import PaymentSection from "@/components/dashboard/payment/page";

type Plan = "free" | "pro";

const getPlan = (user: unknown): Plan => {
  const plan = (user as { plan?: unknown } | null)?.plan;

  return typeof plan === "string" &&
    ["pro", "premium"].includes(plan.toLowerCase())
    ? "pro"
    : "free";
};

export default function TutorPaymentPage() {
  const { user, isLoading, isAuthorized } = useRoleGuard("tutor");

  if (isLoading || !isAuthorized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold text-indigo-700">
          Payments
        </h1>
        <p className="mb-8 text-slate-600">
          Manage your subscription and payment history.
        </p>

        <PaymentSection plan={getPlan(user)} />
      </div>
    </main>
  );
}
