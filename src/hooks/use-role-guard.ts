"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getUserRole, ROUTES, type Role } from "@/lib/roles";

/**
 * Client-side route guard.
 * - Login na thakle -> sign in page
 * - `allowedRole` dile ar role na mille -> /dashboard (jekhane role onujayi redirect hoy)
 *
 * NOTE: Eta shudhu UX-er jonno. Asol security backend API-te role check kore nite hobe.
 */
export function useRoleGuard(allowedRole?: Role) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user ?? null;
  const role = getUserRole(user);
  const isAuthorized = !!user && (!allowedRole || role === allowedRole);

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace(ROUTES.signIn);
      return;
    }

    if (allowedRole && role !== allowedRole) {
      router.replace(ROUTES.dashboard);
    }
  }, [isPending, user, role, allowedRole, router]);

  return { user, role, isLoading: isPending, isAuthorized };
}