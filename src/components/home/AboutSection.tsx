import Link from "next/link";
import { ArrowRight, GraduationCap, ListChecks, MessageSquare, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";
import { ROUTES } from "@/lib/roles";

type Value = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

// Platform-er asol kaj onujayi: admin approval, upfront terms, direct apply
const VALUES: Value[] = [
  {
    title: "Reviewed listings",
    description: "Every tuition post is checked by an admin before it goes live.",
    icon: ShieldCheck,
    accent: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "Clear terms upfront",
    description:
      "Subject, class level, mode, days per week and monthly fee are shown before you apply.",
    icon: ListChecks,
    accent: "bg-purple-100 text-purple-600",
  },
  {
    title: "Direct and simple",
    description: "Students apply directly and tutors accept or reject, with no middlemen.",
    icon: MessageSquare,
    accent: "bg-pink-100 text-pink-600",
  },
];

/**
 * About section. Home page-e ar /about page-e duto jaygay-i use kora jay.
 * `showActions={false}` dile niche-r button-gulo dekhabe na.
 */
export const AboutSection = ({ showActions = true }: { showActions?: boolean }) => {
  return (
    <section id="about" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Visual */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-xl shadow-purple-500/20 md:p-10">
            <div aria-hidden="true" className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
            <div aria-hidden="true" className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/10" />

            <div className="relative">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <GraduationCap className="h-6 w-6" />
              </span>
              <p className="mt-6 text-2xl font-bold leading-snug md:text-3xl">
                Every student deserves the right tutor, and every tutor deserves the right student.
              </p>
              <p className="mt-4 text-sm text-white/80">That is the idea behind {BRAND_NAME}.</p>
            </div>
          </div>

          <div className="relative -mt-8 ml-6 rounded-2xl border border-white/60 bg-white p-5 shadow-lg shadow-indigo-900/10 sm:ml-14">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Our mission</p>
            <p className="mt-1.5 text-sm text-slate-700">
              Make finding and offering tuition across Bangladesh simple, transparent and safe.
            </p>
          </div>
        </div>

        {/* Content */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            About {BRAND_NAME}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            A simpler way to connect{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              students and tutors
            </span>
          </h2>

          <div className="mt-5 space-y-4 text-slate-600">
            <p>
              Finding a good tutor usually means asking around, relying on word of mouth, and agreeing
              on terms without any clear process. We built {BRAND_NAME} to change that.
            </p>
            <p>
              Tutors post tuitions with a clear subject, schedule and fee. Students browse, apply with
              their preferred schedule, and tutors decide who to teach. Everything happens in one
              place.
            </p>
          </div>

          <ul className="mt-8 grid gap-4">
            {VALUES.map(({ title, description, icon: Icon, accent }) => (
              <li key={title} className="flex items-start gap-4">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="mt-0.5 text-sm text-slate-500">{description}</p>
                </div>
              </li>
            ))}
          </ul>

          {showActions && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={ROUTES.tuitions}
                className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 text-sm font-medium text-white shadow-md shadow-purple-500/30 transition-all hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-lg"
              >
                Browse tuitions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href={ROUTES.howItWorks}
                className="inline-flex items-center justify-center rounded-md border border-indigo-200 bg-white/70 px-6 py-3 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
              >
                How it works
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;