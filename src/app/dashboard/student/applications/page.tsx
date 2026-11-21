
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type Application = {
  _id?: string;
  id?: string;
  tuitionId?: string;
  title?: string;
  tuitionTitle?: string;
  tutorName?: string;
  tutorEmail?: string;
  monthlyFee?: number;
  salary?: number;
  status?: string;
  createdAt?: string;
  tuition?: {
    title?: string;
    monthlyFee?: number;
    salary?: number;
  };
  tutor?: {
    name?: string;
    email?: string;
  };
};

const getStatusStyle = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "accepted":
      return "bg-emerald-100 text-emerald-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
};

type ApplicationsResponse =
  | { success?: boolean; data?: Application[] }
  | Application[];

const fetchApplications = (): Promise<ApplicationsResponse> =>
  apiFetch<ApplicationsResponse>("/api/applications/student");

type QuotaStats = {
  currentPlan?: string;
  totalApplied?: number;
  freeApplicationLimit?: number;
  freeApplicationsUsed?: number;
  remainingFreeApplications?: number | null;
  canApply?: boolean;
};

type QuotaResponse = { success?: boolean; data?: QuotaStats } & QuotaStats;

const fetchQuota = (): Promise<QuotaResponse> =>
  apiFetch<QuotaResponse>("/api/applications/student/stats");

const toApplicationList = (response: ApplicationsResponse): Application[] =>
  Array.isArray(response)
    ? response
    : Array.isArray(response.data)
      ? response.data
      : [];

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaStats | null>(null);

  const applyApplications = useCallback((response: ApplicationsResponse) => {
    setApplications(toApplicationList(response));
  }, []);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      applyApplications(await fetchApplications());
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load your applications."
      );
    } finally {
      setLoading(false);
    }
  }, [applyApplications]);

  useEffect(() => {
    let cancelled = false;

    fetchApplications()
      .then((response) => {
        if (!cancelled) {
          applyApplications(response);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Could not load your applications."
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [applyApplications]);

  useEffect(() => {
    let cancelled = false;

    fetchQuota()
      .then((response) => {
        if (!cancelled) setQuota(response.data ?? response);
      })
      .catch(() => {
        // Quota is informational; the applications list still renders.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isFreePlan =
    quota?.currentPlan?.toLowerCase() !== "pro" &&
    quota?.currentPlan?.toLowerCase() !== "premium";

  const handleCancel = async (application: Application) => {
    const id = application._id || application.id;

    if (!id) {
      toast.error("Application ID is unavailable.");
      return;
    }

    if (application.status?.toLowerCase() !== "pending") return;

    if (!window.confirm("Are you sure you want to cancel this tuition application?")) {
      return;
    }

    try {
      setCancelId(id);

      await apiFetch(`/api/applications/${id}`, {
        method: "DELETE",
      });

      toast.success("Application successfully cancelled.");
      await loadApplications();
      // Lifetime usage is unchanged; refresh the banner to make that visible.
      const refreshedQuota = await fetchQuota();
      setQuota(refreshedQuota.data ?? refreshedQuota);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not cancel the application."
      );
    } finally {
      setCancelId(null);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "N/A"
      : parsed.toLocaleDateString();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard/student"
              className="mb-3 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-slate-900">
              My Applications
            </h1>
            <p className="mt-2 text-slate-600">
              Track your tuition applications and their status.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={loadApplications}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </header>

        {isFreePlan && quota && (
          <div
            className={`mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm ${
              quota.canApply === false
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-indigo-200 bg-indigo-50 text-indigo-800"
            }`}
            role="status"
          >
            <p>
              {quota.canApply === false
                ? "You have reached your free application limit. Cancelling or rejecting an application does not restore it."
                : `${quota.freeApplicationsUsed ?? 0} of ${
                    quota.freeApplicationLimit ?? 2
                  } free applications used · ${
                    quota.remainingFreeApplications ?? 0
                  } remaining`}
            </p>
            {quota.canApply === false && (
              <Link href="/pricing" className="font-semibold underline hover:no-underline">
                Upgrade to Pro
              </Link>
            )}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-white/60 bg-white/90 shadow-sm">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-indigo-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="py-16 text-center">
              <h2 className="text-lg font-semibold text-slate-800">
                No applications yet
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Browse available tuitions and apply for one.
              </p>
              <Link
                href="/tuitions"
                className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Browse Tuitions
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-indigo-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-4">Tuition Title</th>
                    <th className="px-5 py-4">Tutor</th>
                    <th className="px-5 py-4">Monthly Fee</th>
                    <th className="px-5 py-4">Applied Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {applications.map((application, index) => {
                    const status = application.status || "pending";
                    const id = application._id || application.id;

                    const title =
                      application.tuitionTitle ||
                      application.tuition?.title ||
                      application.title ||
                      "Untitled Tuition";

                    const tutorName =
                      application.tutorName ||
                      application.tutor?.name ||
                      "N/A";

                    const tutorEmail =
                      application.tutorEmail ||
                      application.tutor?.email ||
                      "N/A";

                    const fee =
                      application.monthlyFee ??
                      application.tuition?.monthlyFee ??
                      application.salary ??
                      application.tuition?.salary ??
                      0;

                    return (
                      <tr
                        key={id || index}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 font-medium text-slate-900">
                          {title}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800">
                            {tutorName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {tutorEmail}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          ৳{fee.toLocaleString("en-BD")}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(application.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(status)}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {status.toLowerCase() === "pending" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={cancelId === id}
                              onClick={() => handleCancel(application)}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              {cancelId === id ? (
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-1 h-4 w-4" />
                              )}
                              Cancel
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No action
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default MyApplicationsPage;
