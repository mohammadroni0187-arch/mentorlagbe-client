"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TuitionCard from "@/components/TuitionCard";
import { apiFetch } from "@/lib/api";
import { extractTuitions, type Tuition } from "@/lib/tuition";

export default function FeaturedTuitions() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiFetch<{ data?: unknown }>("/api/tuitions/latest", { auth: false })
      .then((res) => {
        if (!cancelled) setTuitions(extractTuitions(res).slice(0, 6));
      })
      .catch(() => {
        if (!cancelled) setTuitions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="mx-auto max-w-2xl text-center md:mx-0 md:text-left">
          <h2 className="text-3xl font-bold text-slate-900">
            Featured tuitions
          </h2>
          <p className="mt-3 text-slate-600">
            The six newest approved and active batches posted by verified tutors.
          </p>
        </div>
        <Link
          href="/tuitions"
          className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-white/70 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
        >
          Browse all tuitions
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl border border-white/60 bg-white/80"
              />
            ))
          : tuitions.map((tuition) => (
              <TuitionCard key={tuition.id} tuition={tuition} />
            ))}
      </div>

      {!loading && tuitions.length === 0 && (
        <p className="mt-6 text-center text-sm text-slate-600">
          No featured tuitions are available yet. Please check back soon.
        </p>
      )}
    </section>
  );
}
