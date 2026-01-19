

import { betterAuth } from "better-auth";
import axios from "axios"; // Assuming axios is installed or use fetch

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL;

// Server-side auth instance
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    providers: {
      signIn: async (email:string, password:string) => {
        try {
          const response = await axios.post(`${FASTAPI_URL}/auth/login`, {
            email,
            password,
          });

          const { access_token, id, email: userEmail, name } = response.data;

          return {
            id: String(id),
            email: userEmail,
            name: name,
            token: access_token,
          };
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || "Sign in failed");
          }
          throw new Error("An unexpected error occurred during sign in.");
        }
      },
      signUp: async (email:string, password:string, name:string) => {
        try {
          const response = await axios.post(`${FASTAPI_URL}/auth/register`, {
            email,
            password,
            name,
          });

          const { access_token, id, email: userEmail, name: userName } = response.data;

          return {
            id: String(id),
            email: userEmail,
            name: userName,
            token: access_token,
          };
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || "Sign up failed");
          }
          throw new Error("An unexpected error occurred during sign up.");
        }
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.NEXTAUTH_URL,
  trustedOrigins: ["http://localhost:3000"],
});

