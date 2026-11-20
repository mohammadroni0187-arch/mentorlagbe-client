import Link from "next/link";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";
import { BRAND_NAME, BRAND_TAGLINE, CONTACT, SOCIAL_LINKS } from "@/lib/constants";
import CopyrightYear from "./copyrightYear";


const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "mailto:mohammadroni0187@gmail.com" },
];

const BOTTOM_LINKS = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "Pricing", href: "/pricing" },
];

// lucide-react-er notun version-e brand icon nai, tai inline SVG use korechi.
const SOCIALS = [
  {
    label: "Facebook",
    href: SOCIAL_LINKS.facebook,
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: SOCIAL_LINKS.x,
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.41z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: SOCIAL_LINKS.instagram,
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 fill-none stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" className="fill-current" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: SOCIAL_LINKS.linkedin,
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
      </svg>
    ),
  },
];

const headingClass = "text-xs font-semibold uppercase tracking-wider text-white";
const linkClass = "text-sm text-slate-400 transition-colors hover:text-white";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-300">
      {/* soft gradient glow, theme-er color-e */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="space-y-4">
          <Link href="/" className="flex w-fit items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-xl font-bold text-transparent">
              {BRAND_NAME}
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-slate-400">
            {BRAND_TAGLINE}
          </p>
        </div>

        {/* Quick links */}
        <nav aria-label="Quick links">
          <h3 className={headingClass}>Quick Links</h3>
          <ul className="mt-5 space-y-3">
            {QUICK_LINKS.map(({ label, href }) => (
              <li key={label}>
                {href.startsWith("mailto:") ? (
                  <a href={href} className={linkClass}>
                    {label}
                  </a>
                ) : (
                  <Link href={href} className={linkClass}>
                    {label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact info */}
        <div>
          <h3 className={headingClass}>Contact Info</h3>
          <ul className="mt-5 space-y-3.5 text-sm">
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-3 text-slate-400 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0 text-indigo-400" />
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-3 text-slate-400 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0 text-purple-400" />
                {CONTACT.phone}
              </a>
            </li>
            <li className="flex items-center gap-3 text-slate-400">
              <MapPin className="h-4 w-4 shrink-0 text-pink-400" />
              {CONTACT.address}
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className={headingClass}>Connect With Us</h3>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
            Follow our social channels for study tips, tutor highlights, and updates.
          </p>
          <ul className="mt-4 flex gap-3">
            {SOCIALS.map(({ label, href, icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-slate-300 transition-all hover:-translate-y-0.5 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-pink-500 hover:text-white"
                >
                  {icon}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row">
          <p>
            © <CopyrightYear /> {BRAND_NAME}. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex gap-5">
            {BOTTOM_LINKS.map(({ label, href }) => (
              <Link key={label} href={href} className="transition-colors hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;