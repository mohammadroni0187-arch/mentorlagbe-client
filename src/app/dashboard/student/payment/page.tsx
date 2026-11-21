
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type Payment = {
  _id?: string;
  sessionId?: string;
  amount?: number;
  currency?: string;
  paymentStatus?: string;
  planName?: string;
  createdAt?: string;
};

type PaymentHistoryResponse = {
  success?: boolean;
  data?: Payment[];
};

export default function StudentPaymentPage() {
  const router = useRouter();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<
    "monthly" | "yearly" | null
  >(null);
  const [error, setError] = useState("");

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch<PaymentHistoryResponse>(
        "/api/payments/history"
      );

      setPayments(response.data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Payment history load failed.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleCheckout = async (
    interval: "monthly" | "yearly"
  ) => {
    try {
      setCheckoutLoading(interval);
      setError("");

      const response = await apiFetch<{ url?: string }>(
        "/api/payments/create-plan-checkout-session",
        {
          method: "POST",
          body: {
            audience: "student",
            interval,
          },
        }
      );

      if (!response.url) {
        throw new Error("Stripe checkout URL পাওয়া যায়নি।");
      }

      toast.info("Redirecting to Stripe Checkout...");
      window.location.assign(response.url);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Checkout তৈরি করা যায়নি।";
      setError(message);
      toast.error(message);
      setCheckoutLoading(null);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (payment: Payment) => {
    if (payment.amount === undefined) return "N/A";

    return `${payment.amount.toFixed(2)} ${
      payment.currency?.toUpperCase() || "USD"
    }`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={() => router.back()}
              className="mb-4 flex items-center gap-2 text-sm text-indigo-200 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Student Payments
            </h1>

            <p className="mt-2 text-sm text-indigo-200">
              Manage your subscription and payment history.
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <CreditCard size={28} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
            <XCircle size={20} />
            {error}
          </div>
        )}

        {/* Plans */}
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Choose Your Plan</h2>
            <p className="mt-1 text-sm text-indigo-200">
              Select a subscription plan to continue.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">

            {/* Monthly */}
            <div className="rounded-2xl border border-indigo-300/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-bold">Monthly Pro</h3>
                <span className="rounded-full bg-indigo-400/20 px-3 py-1 text-xs text-indigo-200">
                  Monthly
                </span>
              </div>

              <p className="mb-6 text-sm text-indigo-200">
                Student Pro subscription with monthly billing.
              </p>

              <button
                onClick={() => handleCheckout("monthly")}
                disabled={checkoutLoading !== null}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checkoutLoading === "monthly" ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Subscribe Monthly
                  </>
                )}
              </button>
            </div>

            {/* Yearly */}
            <div className="rounded-2xl border border-purple-300/30 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-bold">Yearly Pro</h3>
                <span className="rounded-full bg-purple-300/20 px-3 py-1 text-xs text-purple-100">
                  Yearly
                </span>
              </div>

              <p className="mb-6 text-sm text-indigo-100">
                Student Pro subscription with yearly billing.
              </p>

              <button
                onClick={() => handleCheckout("yearly")}
                disabled={checkoutLoading !== null}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-500 px-5 py-3 font-semibold transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checkoutLoading === "yearly" ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Subscribe Yearly
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Security */}
        <div className="mb-10 flex items-center gap-3 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-4">
          <ShieldCheck className="shrink-0 text-emerald-300" size={24} />
          <p className="text-sm text-emerald-100">
            Payments are processed securely through Stripe Checkout.
          </p>
        </div>

        {/* Payment History */}
        <section className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-xl sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Payment History</h2>
              <p className="mt-1 text-sm text-indigo-200">
                Your previous transactions.
              </p>
            </div>

            <button
              onClick={loadPayments}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-12 text-indigo-200">
              <Loader2 className="animate-spin" />
              Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard
                size={42}
                className="mx-auto mb-4 text-indigo-300"
              />
              <h3 className="text-lg font-semibold">
                No payments yet
              </h3>
              <p className="mt-2 text-sm text-indigo-200">
                Your payment transactions will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-indigo-200">
                    <th className="px-4 py-4">Plan</th>
                    <th className="px-4 py-4">Amount</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-4 py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment, index) => (
                    <tr
                      key={payment.sessionId || payment._id || index}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="px-4 py-4 font-medium">
                        {payment.planName || "Student Pro"}
                      </td>

                      <td className="px-4 py-4">
                        {formatAmount(payment)}
                      </td>

                      <td className="px-4 py-4 text-indigo-200">
                        {formatDate(payment.createdAt)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                            payment.paymentStatus === "paid"
                              ? "bg-emerald-400/15 text-emerald-300"
                              : "bg-yellow-400/15 text-yellow-300"
                          }`}
                        >
                          {payment.paymentStatus === "paid" ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Clock size={14} />
                          )}
                          {payment.paymentStatus || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
