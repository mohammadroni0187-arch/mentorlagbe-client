import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, Search, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/lib/roles";

const POPULAR_SEARCHES = ["Mathematics", "Physics", "Chemistry", "English", "ICT"];

const TRUST_POINTS = ["Admin-reviewed tuitions", "Free to join", "Apply in minutes"];

/**
 * Home page-er hero/banner.
 * Server component: search ekta normal GET form, tai JavaScript chhaoao kaj kore
 * (/tuitions?search=... e jay, browse page oi value pore).
 */
export const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-indigo-300/40 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-pink-300/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-purple-300/30 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr]">
        {/* Left: content */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-3 py-1 text-xs font-medium text-indigo-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Trusted by students and tutors
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Find the{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              perfect tutor
            </span>{" "}
            for your goals
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-slate-600 md:text-lg lg:mx-0">
            Browse approved tuitions, apply in a few clicks, and learn at your own pace, on your own
            schedule.
          </p>

          {/* Search */}
          <form
            action={ROUTES.tuitions}
            method="get"
            role="search"
            className="mx-auto mt-8 flex max-w-xl flex-col gap-2 rounded-2xl border border-indigo-100 bg-white/90 p-2 shadow-lg shadow-indigo-500/10 sm:flex-row sm:items-center lg:mx-0"
          >
            <label htmlFor="hero-search" className="sr-only">
              Search tuitions by subject or title
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-400" />
              <input
                id="hero-search"
                name="search"
                type="search"
                autoComplete="off"
                placeholder="Search a subject, e.g. Physics"
                className="h-11 w-full rounded-xl bg-transparent pl-10 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 text-sm font-medium text-white shadow-md shadow-purple-500/30 transition-all hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-lg"
            >
              Search tuitions
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Popular */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <span className="text-sm text-slate-500">Popular:</span>
            {POPULAR_SEARCHES.map((subject) => (
              <Link
                key={subject}
                href={`${ROUTES.tuitions}?search=${encodeURIComponent(subject)}`}
                className="rounded-full border border-indigo-200 bg-white/70 px-3 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
              >
                {subject}
              </Link>
            ))}
          </div>

          {/* Secondary CTA */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
            <Link
              href={ROUTES.signUp}
              className="inline-flex items-center justify-center rounded-md border border-indigo-200 bg-white/70 px-6 py-3 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              Become a Tutor
            </Link>
            <Link
              href={ROUTES.howItWorks}
              className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-indigo-600 hover:underline"
            >
              How it works
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-600 lg:justify-start">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: illustration (sample UI, decorative) */}
        <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-md">
          {/* Gradient panel */}
          <div className="absolute inset-4 rotate-3 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-2xl shadow-purple-500/30">
            <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-white/10" />
          </div>

          {/* Main tuition card */}
          <div className="absolute left-0 right-6 top-1/2 -translate-y-1/2 -rotate-2 rounded-2xl bg-white p-5 shadow-xl shadow-indigo-900/10">
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                Physics
              </span>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                Class 11 - 12 (HSC)
              </span>
            </div>
            <p className="mt-3 font-semibold text-slate-900">HSC Physics, 3 days a week</p>
            <p className="mt-1 text-sm text-slate-500">Online · Evening batch</p>
            <div className="mt-4 flex items-center justify-between border-t border-indigo-100 pt-3">
              <p className="text-lg font-bold text-slate-900">
                ৳3,500<span className="text-xs font-normal text-slate-500"> / month</span>
              </p>
              <span className="rounded-md bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-3 py-1.5 text-xs font-medium text-white">
                Apply now
              </span>
            </div>
          </div>

          {/* Approved badge */}
          <div className="absolute right-0 top-6 flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-lg shadow-indigo-900/10">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-900">Approved</p>
              <p className="text-[11px] text-slate-500">Reviewed by admin</p>
            </div>
          </div>

          {/* Applicants */}
          <div className="absolute bottom-6 left-2 flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-lg shadow-indigo-900/10">
            <div className="flex -space-x-2">
              {["A", "R", "S"].map((letter, i) => (
                <span
                  key={letter}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white ${
                    ["bg-indigo-500", "bg-purple-500", "bg-pink-500"][i]
                  }`}
                >
                  {letter}
                </span>
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-900">New applicants</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;