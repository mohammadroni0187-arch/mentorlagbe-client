import Link from "next/link";
import { ArrowLeft, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/lib/roles";

const gradientBtn =
  "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 transition-all hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-white/60 bg-white/85 p-8 text-center shadow-xl shadow-indigo-500/10 backdrop-blur">
        <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <span className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <XCircle className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Payment cancelled
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          No amount was charged. You can choose a Pro plan again whenever you
          are ready.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={ROUTES.pricing}
            className={`${buttonVariants()} ${gradientBtn}`}
          >
            View Pro plans
          </Link>
          <Link
            href={ROUTES.home}
            className={`${buttonVariants({ variant: "outline" })} border-indigo-200 text-indigo-700 hover:bg-indigo-50`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
