import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import AboutSection from "@/components/home/AboutSection";
import { BRAND_NAME } from "@/lib/constants";
import { ROUTES } from "@/lib/roles";

export const metadata: Metadata = {
  title: "About us",
  description: `Learn about ${BRAND_NAME}, a simple and transparent way to connect students and tutors.`,
};

export default function AboutPage() {
  return (
    <main className="bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* Page header */}
      <header className="mx-auto max-w-3xl px-4 pt-16 text-center md:pt-20">
        <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          About us
        </h1>
        <p className="mt-4 text-slate-600">
          Who we are, what we believe, and why we built {BRAND_NAME}.
        </p>
      </header>

      <AboutSection showActions={false} />

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-center text-white shadow-xl shadow-purple-500/20 md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">Ready to get started?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/85">
            Join as a student to find a tutor, or as a tutor to reach students who need you.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={ROUTES.signUp}
              className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              <Users className="mr-2 h-4 w-4" />
              Create free account
            </Link>
            <Link
              href={ROUTES.tuitions}
              className="inline-flex items-center justify-center rounded-md border border-white/60 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Browse tuitions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}