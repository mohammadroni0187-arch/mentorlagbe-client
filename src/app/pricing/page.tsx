
"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  GraduationCap,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  type: "free" | "monthly" | "yearly";
};

const tutorPlans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "Forever",
    description: "Start your tutoring journey.",
    type: "free",
    features: [
      "Up to 2 tuition posts",
      "Browse tuition opportunities",
      "Receive applications",
      "Tutor dashboard access",
    ],
  },
  {
    name: "Monthly Pro",
    price: "Monthly",
    period: "Billed monthly",
    description: "Grow your tutoring business.",
    type: "monthly",
    popular: true,
    features: [
      "Unlimited tuition posts",
      "All Free features",
      "Manage tuition posts",
      "Track student applications",
      "Premium subscription access",
    ],
  },
  {
    name: "Yearly Pro",
    price: "Yearly",
    period: "Billed annually",
    description: "Best for long-term tutors.",
    type: "yearly",
    features: [
      "Unlimited tuition posts",
      "All Monthly Pro features",
      "Annual subscription",
      "Payment history",
      "Subscription management",
    ],
  },
];

const studentPlans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "Forever",
    description: "Find your perfect tutor.",
    type: "free",
    features: [
      "Browse approved tuitions",
      "Apply for tuitions",
      "Track applications",
      "Student dashboard access",
    ],
  },
  {
    name: "Monthly Pro",
    price: "Monthly",
    period: "Billed monthly",
    description: "A better learning experience.",
    type: "monthly",
    popular: true,
    features: [
      "All Free features",
      "Premium student features",
      "Enhanced learning experience",
      "Priority support",
    ],
  },
  {
    name: "Yearly Pro",
    price: "Yearly",
    period: "Billed annually",
    description: "For dedicated learners.",
    type: "yearly",
    features: [
      "All Monthly Pro features",
      "Annual subscription",
      "Premium learning experience",
      "Priority support",
    ],
  },
];

function PlanCard({
  plan,
  audience,
  onSelect,
}: {
  plan: Plan;
  audience: "tutor" | "student";
  onSelect: (plan: Plan, audience: "tutor" | "student") => void;
}) {
  const isPro = plan.type !== "free";

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        plan.popular
          ? "border-indigo-500 bg-gradient-to-br from-indigo-700 to-purple-800 text-white shadow-lg shadow-indigo-200"
          : "border-slate-200 bg-white shadow-md"
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-3 right-4 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold text-slate-900">
          POPULAR
        </span>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{plan.name}</h3>
          <p
            className={`mt-1 text-xs ${
              plan.popular ? "text-indigo-100" : "text-slate-500"
            }`}
          >
            {plan.description}
          </p>
        </div>

        <div
          className={`rounded-xl p-2 ${
            plan.popular
              ? "bg-white/15 text-amber-300"
              : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {isPro ? (
            <Crown className="h-5 w-5" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
        </div>
      </div>

      <div className="my-5">
        <p
          className={`text-2xl font-extrabold ${
            plan.popular ? "text-white" : "text-slate-900"
          }`}
        >
          {plan.price}
        </p>
        <p
          className={`mt-1 text-xs ${
            plan.popular ? "text-indigo-100" : "text-slate-500"
          }`}
        >
          {plan.period}
        </p>
      </div>

      <div className="mb-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start gap-2">
            <Check
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                plan.popular ? "text-amber-300" : "text-green-600"
              }`}
            />
            <span
              className={`text-xs ${
                plan.popular ? "text-indigo-50" : "text-slate-600"
              }`}
            >
              {feature}
            </span>
          </div>
        ))}
      </div>

      <Button
        onClick={() => onSelect(plan, audience)}
        className={`h-10 w-full text-sm font-semibold ${
          plan.popular
            ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
            : isPro
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50"
        }`}
        variant="default"
      >
        {plan.type === "free" ? "Get Started" : "Choose Plan"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

export default function Pricing() {
  const router = useRouter();

  const handleSelect = (
    plan: Plan,
    audience: "tutor" | "student"
  ) => {
    if (plan.type === "free") {
      router.push(
        audience === "tutor"
          ? "/dashboard/tutor"
          : "/dashboard/student"
      );
      return;
    }

    alert(
      `${audience === "tutor" ? "Tutor" : "Student"} ${plan.name} checkout will be connected after the backend update.`
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-100 px-4 py-10 md:py-14">
      <div className="mx-auto max-w-6xl">

        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-8 border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Heading */}
        <header className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-xs font-bold text-indigo-700">
            <Sparkles className="h-4 w-4" />
            MENTORLAGBE PRICING
          </span>

          <h1 className="mt-5 text-3xl font-extrabold text-slate-900 md:text-4xl">
            Simple Plans, Better Opportunities
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600">
            Choose the right plan and take your next step with MentorLagbe.
          </p>
        </header>

        {/* Tutor Plans */}
        <section className="mb-16">
          <div className="mb-7 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Tutor Plans
              </h2>
              <p className="text-xs text-slate-500">
                Grow your tutoring career with the right plan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tutorPlans.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                audience="tutor"
                onSelect={handleSelect}
              />
            ))}
          </div>
        </section>

        {/* Student Plans */}
        <section>
          <div className="mb-7 flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Student Plans
              </h2>
              <p className="text-xs text-slate-500">
                Find tuition opportunities that fit your needs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {studentPlans.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                audience="student"
                onSelect={handleSelect}
              />
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-14 rounded-2xl bg-gradient-to-r from-indigo-700 to-purple-700 px-6 py-8 text-center text-white shadow-lg">
          <h2 className="text-xl font-bold">
            Start Your Journey Today
          </h2>
          <p className="mt-2 text-sm text-indigo-100">
            Join students and tutors building better opportunities together.
          </p>
          <Button
            onClick={() => router.push("/tuitions")}
            className="mt-5 bg-white text-indigo-700 hover:bg-indigo-50"
          >
            Browse Tuitions
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

      </div>
    </main>
  );
}
