import Link from "next/link";
import { ArrowRight, CalendarDays, GraduationCap, Laptop, MapPin, Shuffle, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MODE_LABELS, formatFee, type Mode, type Tuition } from "@/lib/tuition";

const MODE_ICONS: Record<Mode, LucideIcon> = {
  online: Laptop,
  offline: MapPin,
  hybrid: Shuffle,
};

/**
 * Public tuition card: browse page ar home page-er latest section-e use kora jabe.
 */
export const TuitionCard = ({ tuition }: { tuition: Tuition }) => {
  const ModeIcon = MODE_ICONS[tuition.mode];

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10">
      <Link
        href={`/tuitions/${tuition.id}`}
        className="relative block aspect-[16/8] bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100"
        tabIndex={-1}
        aria-hidden="true"
      >
        {tuition.bannerImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tuition.bannerImage}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-indigo-300">
            <GraduationCap className="h-10 w-10" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            {tuition.subject}
          </span>
          {tuition.classLevel && (
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
              {tuition.classLevel}
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 font-semibold text-slate-900">
          <Link href={`/tuitions/${tuition.id}`} className="hover:text-indigo-700">
            {tuition.title}
          </Link>
        </h3>

        <ul className="grid gap-1.5 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <ModeIcon className="h-4 w-4 shrink-0 text-indigo-500" />
            <span className="truncate">
              {MODE_LABELS[tuition.mode]}
              {tuition.mode !== "online" && tuition.location && ` · ${tuition.location}`}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-pink-500" />
            {tuition.daysPerWeek} {tuition.daysPerWeek === 1 ? "day" : "days"} / week
          </li>
        </ul>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-indigo-100 pt-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-lg font-bold text-slate-900">
              <Wallet className="h-4 w-4 text-purple-500" />
              {formatFee(tuition.monthlyFee)}
              <span className="text-xs font-normal text-slate-500">/ month</span>
            </p>
            {tuition.tutorName && (
              <p className="truncate text-xs text-slate-500">by {tuition.tutorName}</p>
            )}
          </div>
          <Link
            href={`/tuitions/${tuition.id}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-md bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-3 py-1.5 text-sm font-medium text-white shadow-md shadow-purple-500/30 transition-all hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700"
          >
            Details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default TuitionCard;