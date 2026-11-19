import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:5000",

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

export const { signIn, signUp, signOut, useSession,}=authClient;