"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";

type TestResult =
  | { status: "idle" }
  | { status: "success"; data: unknown }
  | { status: "error"; message: string; code?: number };

const TestApiPage = () => {
  const [result, setResult] = useState<TestResult>({ status: "idle" });
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/admin/tutor-test");
      setResult({ status: "success", data });
      toast.success("API request succeeded.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setResult({
        status: "error",
        message,
        code: err instanceof ApiError ? err.status : undefined,
      });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 md:p-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent">
          Protected API Test
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Calls <code className="rounded bg-white/70 px-1.5 py-0.5">GET /api/admin/tutor-test</code>{" "}
          with your session token.
        </p>

        <Button
          onClick={handleTest}
          disabled={loading}
          className="mt-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Tutor API"
          )}
        </Button>

        {result.status !== "idle" && (
          <div className="mt-6" aria-live="polite">
            {result.status === "error" ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-medium">
                  Request failed{result.code ? ` (${result.code})` : ""}
                </p>
                <p className="mt-1">{result.message}</p>
              </div>
            ) : (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-700">Success</p>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-white p-3 text-xs text-slate-800">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default TestApiPage;