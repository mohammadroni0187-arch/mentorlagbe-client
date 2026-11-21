
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { apiFetch } from "@/lib/api";

type Transaction = {
  _id?: string;
  userName?: string;
  userEmail?: string;
  role?: string;
  planName?: string;
  amount?: number;
  currency?: string;
  sessionId?: string;
  paymentStatus?: string;
  createdAt?: string;
};

type TransactionsResponse = { data?: Transaction[] } | Transaction[];

const fetchTransactions = (): Promise<TransactionsResponse> =>
  apiFetch<TransactionsResponse>("/api/admin/transactions");

const AdminTransactionsPage = () => {
  const { user, isLoading, isAuthorized } = useRoleGuard("admin");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const applyTransactions = useCallback((response: TransactionsResponse) => {
    setTransactions(
      Array.isArray(response) ? response : response.data ?? []
    );
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      applyTransactions(await fetchTransactions());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load transactions.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [applyTransactions]);

  useEffect(() => {
    if (!isAuthorized || !user) return;

    let cancelled = false;

    fetchTransactions()
      .then((response) => {
        if (!cancelled) {
          applyTransactions(response);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Could not load transactions.";
          setError(message);
          toast.error(message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthorized, user, applyTransactions]);

  if (isLoading || !isAuthorized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
      </div>
    );
  }

  const totalRevenue = transactions
    .filter((item) => item.paymentStatus === "paid")
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50 to-indigo-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-700 p-7 text-white shadow-lg">
          <Link
            href="/dashboard/admin"
            className="mb-4 inline-flex items-center text-sm text-emerald-100 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Transaction Management</h1>
          <p className="mt-2 text-emerald-100">
            Review all Stripe subscription transactions.
          </p>
        </header>

        <div className="mb-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-lg">
            <p className="text-sm text-emerald-100">Total Paid Transactions</p>
            <p className="mt-2 text-3xl font-bold">
              {loading
                ? "..."
                : transactions.filter((item) => item.paymentStatus === "paid").length}
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg">
            <p className="text-sm text-indigo-100">Revenue (Returned Records)</p>
            <p className="mt-2 text-3xl font-bold">
              {loading ? "..." : `$ ${totalRevenue.toLocaleString("en-USD")}`}
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-white bg-white/90 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
            <div>
              <h2 className="font-bold text-slate-800">All Transactions</h2>
              <p className="text-sm text-slate-500">
                {transactions.length} records
              </p>
            </div>
            <button
              onClick={loadTransactions}
              disabled={loading}
              className="inline-flex items-center rounded-lg border px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {error && (
            <p className="m-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              {error}
            </p>
          )}

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-emerald-50 text-slate-600">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((item, index) => (
                    <tr
                      key={item._id || item.sessionId || index}
                      className="hover:bg-emerald-50/40"
                    >
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">
                          {item.userName || "N/A"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.userEmail || "N/A"}
                        </p>
                      </td>
                      <td className="p-4 capitalize">{item.role || "N/A"}</td>
                      <td className="p-4">{item.planName || "Premium"}</td>
                      <td className="p-4 font-semibold text-slate-800">
                        {(item.currency || "usd").toUpperCase()}{" "}
                        {item.amount ?? 0}
                      </td>
                      <td className="max-w-48 truncate p-4 font-mono text-xs text-slate-500">
                        {item.sessionId || "N/A"}
                      </td>
                      <td className="p-4 text-slate-600">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                          {item.paymentStatus || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {transactions.length === 0 && (
                <div className="p-12 text-center">
                  <CreditCard className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 font-semibold text-slate-700">
                    No transactions found
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminTransactionsPage;
