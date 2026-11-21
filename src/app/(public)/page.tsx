import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  MessageSquare,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import FeaturedTuitions from "@/components/FeaturedTuitions";
import HeroBanner from "@/components/home/HeroBanner";
import AboutSection from "@/components/home/AboutSection";

const STATS = [
  { value: "500+", label: "Verified tutors" },
  { value: "2,000+", label: "Happy students" },
  { value: "50+", label: "Subjects" },
  { value: "4.8/5", label: "Average rating" },
];

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

const FEATURES: Feature[] = [
  {
    title: "Verified Tutors",
    description:
      "Every tutor profile is reviewed so you can learn with confidence.",
    icon: BadgeCheck,
    accent: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "Easy Search",
    description:
      "Filter by subject, class, location and budget to find the right match fast.",
    icon: Search,
    accent: "bg-purple-100 text-purple-600",
  },
  {
    title: "Secure Payments",
    description:
      "Pay safely through the platform and keep a clear payment history.",
    icon: Wallet,
    accent: "bg-pink-100 text-pink-600",
  },
  {
    title: "Direct Communication",
    description:
      "Talk to tutors and agree on schedules before you start.",
    icon: MessageSquare,
    accent: "bg-sky-100 text-sky-600",
  },
];

const STEPS = [
  {
    title: "Create your account",
    description:
      "Sign up as a student or a tutor in less than a minute.",
  },
  {
    title: "Find or post a tuition",
    description:
      "Browse tutors and tuitions, or post what you are looking for.",
  },
  {
    title: "Connect and learn",
    description:
      "Apply, get accepted, and start learning with the right person.",
  },
];

export default function Home() {
  return (
    <>
      <HeroBanner />

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4">
        <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur md:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <dt className="sr-only">{label}</dt>
              <dd className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                {value}
              </dd>
              <p className="mt-1 text-sm text-slate-500" aria-hidden="true">
                {label}
              </p>
            </div>
          ))}
        </dl>
      </section>

      <AboutSection />

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Why choose us
          </h2>
          <p className="mt-3 text-slate-600">
            Everything you need to find, connect with, and learn from the
            right tutor.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ title, description, icon: Icon, accent }) => (
            <div
              key={title}
              className="rounded-xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="font-semibold text-slate-900">{title}</h3>

              <p className="mt-1.5 text-sm text-slate-500">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic latest approved tuitions */}
      <FeaturedTuitions />

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-20 bg-white/60 py-20"
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              How it works
            </h2>
            <p className="mt-3 text-slate-600">
              Get started in three simple steps.
            </p>
          </div>

          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map(({ title, description }, i) => (
              <li key={title} className="relative text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-lg font-bold text-white shadow-md shadow-purple-500/30">
                  {i + 1}
                </span>

                <h3 className="mt-4 font-semibold text-slate-900">
                  {title}
                </h3>

                <p className="mt-1.5 text-sm text-slate-500">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Popular subjects */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Explore popular subjects
          </h2>
          <p className="mt-3 text-slate-600">
            From school subjects to exam preparation, find the right guidance.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {["Mathematics", "Physics", "Programming", "IELTS"].map((subject) => (
            <Link
              key={subject}
              href="/tuitions"
              className="rounded-2xl border border-white/60 bg-white/80 p-6 text-center font-semibold text-slate-800 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:text-indigo-700 hover:shadow-lg hover:shadow-indigo-500/10"
            >
              {subject}
            </Link>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-indigo-100 bg-white/80 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">For tutors</h3>
            <p className="mt-2 text-sm text-slate-600">
              Start free with 2 posts, or upgrade to Pro for $15/month and post
              unlimited tuitions.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:underline"
            >
              See tutor plans <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-purple-100 bg-white/80 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">For students</h3>
            <p className="mt-2 text-sm text-slate-600">
              Browse and apply for free, or get Student Pro for $10/month with
              priority booking.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:underline"
            >
              See student plans <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-center text-white shadow-xl shadow-purple-500/20 md:p-14">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <BookOpen className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-2xl font-bold md:text-3xl">
            Ready to start learning?
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-white/85">
            Join as a student to find a tutor, or as a tutor to reach
            students who need you.
          </p>

          <ul className="mx-auto mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/90">
            {["Free to join", "Verified profiles", "Secure payments"].map(
              (item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  {item}
                </li>
              )
            )}
          </ul>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signUp"
              className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              <Users className="mr-2 h-4 w-4" />
              Create free account
            </Link>

            <Link
              href="/signIn"
              className="inline-flex items-center justify-center rounded-md border border-white/60 bg-transparent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Sign IN
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}