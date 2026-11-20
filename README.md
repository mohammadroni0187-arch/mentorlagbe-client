# MentorLagbe (Client)

Smart Tuition & Mentorship Platform — role-based frontend built with Next.js (App Router), TypeScript and Tailwind CSS.

## Project Overview

MentorLagbe connects students with verified tutors. Students search, filter and apply to approved tuition batches; tutors post and manage tuitions and review applicants; admins moderate listings, manage roles and track payments. Both tutors and students can upgrade to a Stripe-powered Pro plan.

- **Monorepo layout:** `mentorlagbe-client` (this repository) + `mentorlagbe-server` (Express/MongoDB API).
- **Configured application URL:** `http://localhost:3000` (from `.env.local` / `.env`). No deployed live URL is configured in this repository.
- **Client GitHub repository:** https://github.com/mohammadroni0187-arch/mentorlagbe-client.git
- **Server GitHub repository:** https://github.com/mohammadroni0187-arch/mentorlagbe-server.git

## Technology Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16.4.6 (App Router), React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, DaisyUI, shadcn/ui primitives |
| Auth client | BetterAuth React client + JWT plugin client |
| Forms / icons | React Hook Form, lucide-react |
| Notifications | Sonner, react-toastify |
| HTTP | Fetch wrapper (`src/lib/api.ts`) with Bearer JWT injection |
| Media | ImgBB direct upload |

## Key Features

- Landing page with dynamic featured tuitions, how-it-works, popular subjects, pricing and statistics.
- Browse Tuitions with server-side search (title/subject) and filters for subject, class level, mode (Online/Offline/Hybrid), sorting and pagination.
- Tuition details page with a student-only application form and duplicate-application protection.
- Role-based dashboards for Student, Tutor and Admin with a collapsible sidebar.
- Tutor tuition CRUD (create, edit, delete, active/closed toggle) with ImgBB banner upload and free-plan post limit.
- Tutor applicant management (accept/reject pending applications only).
- Student application tracking with pending-only cancellation.
- Admin user role management, tuition approval/rejection and Stripe transaction overview.
- Profile update (name, phone, bio, ImgBB image upload or image URL) for every role.
- Stripe Checkout for Pro plans with `/payment/success` verification and `/payment/cancel`.
- Global loading, custom `not-found.tsx` and `error.tsx`, toast notifications and responsive layouts.

## Role Functionality

### Student
- Sign up as Student, browse and filter approved tuitions, view details, apply once per tuition.
- View all applications with status badges; cancel only pending applications.
- Upgrade to Student Pro ($10/month) and view payment history.

### Tutor
- Sign up as Tutor, post up to 2 tuitions on the Free plan (unlimited on Pro).
- Edit, delete and toggle active/closed status for own tuitions.
- Review applicants and accept/reject only pending applications.
- Upgrade to Tutor Pro ($15/month).

### Admin
- View platform statistics (users, tutors, pending/approved tuitions, revenue).
- Change user roles, approve/reject pending tuitions, review all Stripe transactions.

## Authentication & Authorization

- Sign-up (`/signUp`) and sign-in (`/signIn`) are handled by BetterAuth on the Express server.
- New accounts are forced to `role: student | tutor` and `plan: free`; admin is assigned by an existing admin through the admin API.
- On login the BetterAuth JWT plugin issues a JWT. The client reads it via `authClient.token()` and sends it as `Authorization: Bearer <token>` to protected APIs.
- Session persistence after reload is provided by BetterAuth cookies + `authClient.useSession()`. Client route guards are UX only; all real authorization is enforced by server middleware (`verifyToken`, `verifyStudent`, `verifyTutor`, `verifyAdmin`).
- Unauthenticated users are redirected to sign-in from private routes; wrong-role users cannot access protected API endpoints.

## MongoDB Collections (owned by the server)

| Collection | Purpose |
| --- | --- |
| `user` | BetterAuth users: name, email, image, role, phone, bio, plan, createdAt |
| `tuitions` | Tutor posts: title, subject, classLevel, mode, location, monthlyFee, daysPerWeek, bannerImage, tutorId, tutorName, tutorEmail, approvalStatus, isActive, createdAt |
| `applications` | Student applications: tuitionId, studentId/email, tutorId/email, preferredSchedule, note, status, createdAt |
| `payments` | Stripe Pro transactions: userId, userEmail, userName, userRole, planName, amount, currency, transactionId, stripeSessionId, paymentStatus, paidAt |

## Stripe Payment Workflow

1. Pricing page sends `POST /api/payments/create-plan-checkout-session` with `audience` (`tutor`/`student`) and `interval` (`monthly`/`yearly`).
2. Server validates the role and uses the matching configured Stripe price ID.
3. Stripe Checkout opens; success redirects to `/payment/success?session_id=...`, cancel to `/payment/cancel`.
4. Success page calls `POST /api/payments/verify-checkout-session`; the server verifies ownership and payment status, sets `plan: "pro"` and upserts one payment record.
5. A Stripe webhook (`/api/payments/webhook`) performs the same sync when `STRIPE_WEBHOOK_SECRET` is configured.

## ImgBB Image Upload Workflow

- **Tutor banner:** Post Tuition / Edit Tuition selects a JPG/PNG/WEBP file (max 5MB), validates it client-side, uploads the real file to ImgBB and stores the returned URL in `tuitions.bannerImage`.
- **Profile picture:** Update Profile uploads the selected file to ImgBB (or accepts a direct URL) and saves the URL on the `user` document.
- Loading spinners and success/error toasts are shown during upload and save.

## Environment Variables (names only — no secret values)

Create `.env.local` in this client repository:

```bash
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
MONGO_URI=
DB_NAME=
GOOGLE_URI=
GOOGLE_SECRET=
NEXT_PUBLIC_IMGBB_API_KEY=
NEXT_PUBLIC_API_URL=
FRONTEND_URL=
```

`NEXT_PUBLIC_API_URL` must point to the Express server (local default: `http://localhost:5000`).

## Installation

```bash
git clone https://github.com/mohammadroni0187-arch/mentorlagbe-client.git
cd mentorlagbe-client
npm install
cp .env.example .env.local  # or create .env.local with the names above
npm run dev
```

Open http://localhost:3000. The API server must be running alongside it (see the server README).

## Local Development Commands

```bash
npm run dev     # development server
npm run build   # production build
npm start       # run the production build
npm run lint    # ESLint
```

## Build & Deployment

```bash
npm run build
npm start
```

Deploy the client to a Node-capable host (e.g. Vercel). Configure every environment variable in the hosting dashboard. Set `NEXT_PUBLIC_API_URL` to the deployed API URL and update `FRONTEND_URL` on the server so CORS and Stripe redirects work in production.

## Testing Accounts

The database contains accounts with these emails (passwords are hashed and are **not** stored in this repository; set/reset them locally before testing):

- Admin: `admin2@gmail.com`
- Tutor: `ronihawlader0140622@gmail.com`
- Student: `mohammadroni0187@gmail.com`

No passwords are invented or published here.

## Important npm Packages

`next`, `react`, `react-dom`, `typescript`, `better-auth`, `@better-auth/mongo-adapter`, `mongodb`, `axios`, `react-hook-form`, `lucide-react`, `sonner`, `react-toastify`, `shadcn`, `tailwindcss`, `daisyui`, `tw-animate-css`, `@base-ui/react`, `eslint`.
