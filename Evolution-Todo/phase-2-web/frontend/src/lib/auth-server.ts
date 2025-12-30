import { betterAuth } from "better-auth";

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL;

// Server-side auth instance
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    providers: {
      signIn: async (email: string, password: string) => {
        try {
          const response = await fetch(`${FASTAPI_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Sign in failed");
          }

          const data = await response.json();
          const { access_token, id, email: userEmail, name } = data;

          return {
            id: String(id),
            email: userEmail,
            name: name,
            token: access_token,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("An unexpected error occurred during sign in.");
        }
      },

      signUp: async (email: string, password: string, name: string) => {
        try {
          const response = await fetch(`${FASTAPI_URL}/auth/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password,
              name,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Sign up failed");
          }

          const data = await response.json();
          const { access_token, id, email: userEmail, name: userName } = data;

          return {
            id: String(id),
            email: userEmail,
            name: userName,
            token: access_token,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("An unexpected error occurred during sign up.");
        }
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    process.env.NEXTAUTH_URL || "",
  ].filter(Boolean),
});
