
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Crown, Loader2, RefreshCw } from "lucide-react";

type Plan = "free" | "pro";

type PaymentItem = {
  _id?: string;
  sessionId?: string;
  amount?: number;
  currency?: string;
  paymentStatus?: string;
  createdAt?: string;
};

type SubscriptionInfo = {
  id?: string;
  status?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: number | string;
};

const PaymentSection = ({ plan }: { plan: Plan }) => {
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [subscription, setSubscription] =
    useState<SubscriptionInfo | null>(null);

  const loadPaymentData = async () => {
    const [history, subscriptionResult] = await Promise.allSettled([
      apiFetch<{ data?: PaymentItem[] }>("/api/payments/history"),
      apiFetch<{
        subscription?: SubscriptionInfo | null;
        data?: { subscription?: SubscriptionInfo | null };
      }>("/api/payments/subscription"),
    ]);

    if (history.status === "fulfilled") {
      setPayments(
        Array.isArray(history.value.data) ? history.value.data : []
      );
    }

    if (subscriptionResult.status === "fulfilled") {
      const result = subscriptionResult.value;
      setSubscription(
        result.subscription ?? result.data?.subscription ?? null
      );
    }
  };

  useEffect(() => {
    loadPaymentData();
  }, []);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await apiFetch<{ url?: string; message?: string }>(
        "/api/payments/create-checkout-session",
        { method: "POST", body: {} }
      );

      if (response.url) {
        window.location.href = response.url;
      } else {
        setMessage(response.message || "Checkout session তৈরি হয়নি।");
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Payment failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("তুমি কি Subscription cancel করতে চাও?")) return;

    try {
      setCancelLoading(true);
      setMessage("");

      const response = await apiFetch<{ message?: string }>(
        "/api/payments/cancel-subscription",
        { method: "POST", body: {} }
      );

      setMessage(response.message || "Cancellation request sent.");
      await loadPaymentData();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Cancel করা যায়নি।"
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (date?: string | number) => {
    if (!date) return "N/A";

    const parsed =
      typeof date === "number" ? new Date(date * 1000) : new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "N/A"
      : parsed.toLocaleDateString();
  };

  return (
    <section className="mb-8 space-y-5">
      <div className="rounded-xl border border-indigo-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Subscription & Payment
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Current Plan: <strong className="text-indigo-600">{plan}</strong>
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {plan === "pro"
                ? "Unlimited tuition posts."
                : "Upgrade to Premium for unlimited tuition posts."}
            </p>

            {subscription?.status && (
              <p className="mt-1 text-sm text-slate-500">
                Status: {subscription.status}
              </p>
            )}

            {subscription?.currentPeriodEnd && (
              <p className="mt-1 text-sm text-slate-500">
                Period ends: {formatDate(subscription.currentPeriodEnd)}
              </p>
            )}

            {subscription?.cancelAtPeriodEnd && (
              <p className="mt-2 text-sm text-amber-600">
                Cancellation scheduled at period end.
              </p>
            )}
          </div>

          {plan === "free" ? (
            <Button onClick={handleUpgrade} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Crown className="mr-2 h-4 w-4" />
              )}
              {loading ? "Redirecting..." : "Upgrade to Premium"}
            </Button>
          ) : subscription?.cancelAtPeriodEnd ? (
            <span className="text-sm text-amber-600">
              Cancellation Scheduled
            </span>
          ) : (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={cancelLoading}
            >
              {cancelLoading ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-indigo-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Payment History
          </h2>
          <Button variant="outline" size="sm" onClick={loadPaymentData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {payments.length === 0 ? (
          <p className="py-5 text-sm text-slate-500">
            No payment history found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <tr
                    key={payment._id || payment.sessionId || index}
                    className="border-b last:border-0"
                  >
                    <td className="py-3 pr-4">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="py-3 pr-4">
                      {payment.amount ?? 0}{" "}
                      {(payment.currency || "usd").toUpperCase()}
                    </td>
                    <td className="py-3">
                      {payment.paymentStatus || "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {message && (
        <p className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700">
          {message}
        </p>
      )}
    </section>
  );
};

export default PaymentSection;
