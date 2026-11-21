"use client";

import { Suspense, useEffect, useState } from "react";
import { RefreshCw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/Pagination";
import TuitionCard from "@/components/TuitionCard";
import { apiFetch } from "@/lib/api";
import {
  CLASS_LEVELS,
  MODE_LABELS,
  SUBJECT_SUGGESTIONS,
  extractTuitions,
  getErrorMessage,
  type Mode,
  type Tuition,
} from "@/lib/tuition";
import { useRouter, useSearchParams } from "next/navigation";

const PAGE_SIZE = 9;

type Filters = {
  search: string;
  subject: string;
  classLevel: string;
  mode: "" | Mode;
  sort: string;
};

const DEFAULT_FILTERS: Filters = {
  search: "",
  subject: "",
  classLevel: "",
  mode: "",
  sort: "newest",
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "fee_asc", label: "Fee: low to high" },
  { value: "fee_desc", label: "Fee: high to low" },
];

type Result = {
  key: string; // kon query-r result, loading ber korar jonno
  items: Tuition[];
  total: number;
  totalPages: number;
  error: string | null;
};

const inputClass =
  "border-indigo-200 bg-white/70 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30";

const selectClass =
  "h-9 w-full rounded-md border border-indigo-200 bg-white/70 px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-indigo-500 focus-visible:ring-[3px] focus-visible:ring-indigo-500/30";

const SkeletonCard = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-white/60 bg-white/80">
    <div className="aspect-[16/8] bg-indigo-100" />
    <div className="space-y-3 p-4">
      <div className="h-4 w-1/2 rounded bg-indigo-100" />
      <div className="h-4 w-3/4 rounded bg-indigo-100" />
      <div className="h-3 w-2/3 rounded bg-indigo-50" />
      <div className="h-8 w-full rounded bg-indigo-50" />
    </div>
  </div>
);

const TuitionsBrowser = () => {
  const router = useRouter();
  // Home-er hero search (/tuitions?search=physics) theke asha value
  const initialSearch = useSearchParams().get("search")?.trim() ?? "";
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS, search: initialSearch });
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  

  // Search box-e likhle 400ms por query chalabo (prottek key-te na)
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = searchInput.trim();
      setFilters((f) => (f.search === value ? f : { ...f, search: value }));
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), sort: filters.sort });
  if (filters.search) params.set("search", filters.search);
  if (filters.subject) params.set("subject", filters.subject);
  if (filters.classLevel) params.set("classLevel", filters.classLevel);
  if (filters.mode) params.set("mode", filters.mode);
  const queryKey = `${params.toString()}#${reloadKey}`;
  const queryString = params.toString();

  useEffect(() => {
    let cancelled = false;

    apiFetch<{ data?: unknown; total?: number; totalPages?: number }>(
      `/api/tuitions?${queryString}`,
      { auth: false }
    )
      .then((res) => {
        if (cancelled) return;
        setResult({
          key: queryKey,
          items: extractTuitions(res),
          total: typeof res.total === "number" ? res.total : 0,
          totalPages: typeof res.totalPages === "number" ? res.totalPages : 1,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setResult({
          key: queryKey,
          items: [],
          total: 0,
          totalPages: 1,
          error: getErrorMessage(err, "Tuition list load kora jayni"),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [queryString, queryKey]);

  // Result jotokkhon current query-r na hoy, totokkhon loading
  const loading = result?.key !== queryKey;

  const updateFilter = <K extends keyof Filters>(name: K, value: Filters[K]) => {
    setFilters((f) => ({ ...f, [name]: value }));
    setPage(1);
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.subject ||
    filters.classLevel ||
    filters.mode ||
    searchInput
  );

  const clearFilters = () => {
    setSearchInput("");
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const changePage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4 py-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-indigo-200 bg-white/80 text-indigo-700 hover:bg-indigo-50"
          >
            ← Back
          </Button>
        </div>
        <header className="mb-8 text-center">
          <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
            Browse Tuitions
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Find an approved tuition that fits your subject, class and schedule.
          </p>
        </header>

        {/* Filters */}
        <section
          aria-label="Filters"
          className="grid gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]"
        >
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title or subject"
              aria-label="Search tuitions"
              className={`${inputClass} pl-9`}
            />
          </div>

          <select
            value={filters.subject}
            onChange={(e) => updateFilter("subject", e.target.value)}
            aria-label="Subject"
            className={selectClass}
          >
            <option value="">All subjects</option>
            {SUBJECT_SUGGESTIONS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          <select
            value={filters.classLevel}
            onChange={(e) => updateFilter("classLevel", e.target.value)}
            aria-label="Class level"
            className={selectClass}
          >
            <option value="">All classes</option>
            {CLASS_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <select
            value={filters.mode}
            onChange={(e) => updateFilter("mode", e.target.value as Filters["mode"])}
            aria-label="Mode"
            className={selectClass}
          >
            <option value="">Any mode</option>
            {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
              <option key={m} value={m}>
                {MODE_LABELS[m]}
              </option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            aria-label="Sort by"
            className={selectClass}
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <X className="mr-1.5 h-4 w-4" />
              Clear
            </Button>
          )}
        </section>

        {/* Count */}
        <p className="mt-5 min-h-5 text-sm text-slate-600" aria-live="polite">
          {!loading && result && !result.error && (
            <>
              {result.total === 0
                ? "No tuitions found"
                : `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, result.total)} of ${result.total} tuitions`}
            </>
          )}
        </p>

        {/* Body */}
        <div className="mt-4">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
              {Array.from({ length: 6 }, (_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : result?.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="font-medium text-red-700">{result.error}</p>
              <Button
                onClick={() => setReloadKey((k) => k + 1)}
                variant="outline"
                className="mt-4 border-red-200 hover:bg-red-100"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </div>
          ) : result && result.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-indigo-200 bg-white/60 p-10 text-center">
              <h2 className="text-lg font-semibold text-slate-900">No tuitions match your search</h2>
              <p className="mt-1 text-sm text-slate-600">
                Try a different keyword or remove some filters.
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline" className="mt-4 border-indigo-200 hover:bg-indigo-50">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {result?.items.map((t) => <TuitionCard key={t.id} tuition={t} />)}
            </div>
          )}
        </div>

        {!loading && result && !result.error && (
          <div className="mt-10">
            <Pagination page={page} totalPages={result.totalPages} onChange={changePage} />
          </div>
        )}
      </div>
    </main>
  );
};

// useSearchParams-er jonno Suspense boundary lage
const TuitionsPage = () => (
  <Suspense fallback={<div className="min-h-screen" />}>
    <TuitionsBrowser />
  </Suspense>
);

export default TuitionsPage;