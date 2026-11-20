
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, RefreshCw, X } from "lucide-react";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

type Tuition = {
  _id: string;
  title?: string;
  subject?: string;
  classLevel?: string;
  tutorName?: string;
  tutorEmail?: string;
  salary?: number;
  monthlyFee?: number;
  mode?: string;
  approvalStatus?: string;
  createdAt?: string;
};

const AdminTuitionsPage = () => {
  const { user, isLoading, isAuthorized } = useRoleGuard("admin");
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const loadTuitions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ data?: Tuition[] } | Tuition[]>(
        "/api/admin/tuitions/pending"
      );
      setTuitions(Array.isArray(response) ? response : response.data ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Tuitions load failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized && user) loadTuitions();
  }, [isAuthorized, user, loadTuitions]);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      setProcessing(id);
      setMessage("");

      await apiFetch(`/api/admin/tuitions/${id}/status`, {
        method: "PATCH",
        body: { status },
      });

      setTuitions((current) => current.filter((item) => item._id !== id));
      setMessage(`Tuition ${status} successfully.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Status update failed.");
    } finally {
      setProcessing(null);
    }
  };

  if (isLoading || !isAuthorized || !user) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-indigo-600" /></div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50 to-indigo-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-900 p-7 text-white shadow-lg">
          <Link href="/dashboard/admin" className="mb-4 inline-flex items-center text-sm text-purple-100 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Tuition Approval</h1>
          <p className="mt-2 text-purple-100">Review tuition posts submitted by tutors.</p>
        </header>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Pending Tuitions</h2>
              <p className="text-sm text-slate-500">{tuitions.length} awaiting review</p>
            </div>
            <button onClick={loadTuitions} disabled={loading} className="inline-flex items-center rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {message && <p className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700">{message}</p>}

          {loading ? (
            <div className="flex justify-center rounded-xl bg-white p-12"><Loader2 className="h-7 w-7 animate-spin text-indigo-600" /></div>
          ) : tuitions.length === 0 ? (
            <div className="rounded-2xl border border-white bg-white/90 p-12 text-center shadow-sm">
              <Check className="mx-auto h-10 w-10 text-emerald-500" />
              <h3 className="mt-3 text-lg font-bold text-slate-800">All caught up!</h3>
              <p className="mt-1 text-sm text-slate-500">There are no pending tuition posts.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {tuitions.map((item) => (
                <article key={item._id} className="rounded-2xl border border-white bg-white/90 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pending Review</span>
                      <h3 className="mt-3 text-lg font-bold text-slate-800">{item.title || "Untitled Tuition"}</h3>
                      <p className="mt-1 text-sm text-slate-500">{item.subject || "Subject not specified"} · {item.classLevel || "Class not specified"}</p>
                    </div>
                    <span className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700">
                      ৳{(item.monthlyFee ?? item.salary ?? 0).toLocaleString("en-BD")}
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p><strong className="text-slate-800">Tutor:</strong> {item.tutorName || "N/A"}</p>
                    <p><strong className="text-slate-800">Email:</strong> {item.tutorEmail || "N/A"}</p>
                    <p><strong className="text-slate-800">Mode:</strong> {item.mode || "N/A"}</p>
                    <p><strong className="text-slate-800">Submitted:</strong> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      onClick={() => updateStatus(item._id, "approved")}
                      disabled={processing === item._id}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {processing === item._id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateStatus(item._id, "rejected")}
                      disabled={processing === item._id}
                    >
                      <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminTuitionsPage;
