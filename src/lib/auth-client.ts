import {
  inferAdditionalFields,
  jwtClient,
} from "better-auth/client/plugins";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // No absolute baseURL: Better Auth falls back to the current origin + /api/auth.
  // /api/auth/* is proxied to the Express API by next.config.ts, so the session
  // cookie is stored as a first-party cookie (required by mobile browsers).
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
        },
        phone: {
          type: "string",
          required: false,
        },
        bio: {
          type: "string",
          required: false,
        },
        plan: {
          type: "string",
          required: false,
        },
      },
    }),
    jwtClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;