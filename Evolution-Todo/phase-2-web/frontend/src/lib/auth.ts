// // For client-side usage
// import { createAuthClient } from 'better-auth/client';

// // Create auth client instance for client-side usage
// export const authClient = createAuthClient({
//   baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
// });

// // Export client methods
// export const { signIn, signOut, useSession } = authClient;
// // Server-side API route auth only
// export const auth = {
//   handler: {
//     GET: async (req: Request) => {
//       const backendUrl = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:8000'}/api`;
//       const response = await fetch(backendUrl, {
//         method: 'GET',
//         headers: req.headers,
//       });
//       const data = await response.json();
//       return Response.json(data, { status: response.status });
//     },
//     POST: async (req: Request) => {
//       const backendUrl = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:8000'}/api`;
//       const body = await req.json();
//       const response = await fetch(backendUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...Object.fromEntries(req.headers.entries()),
//         },
//         body: JSON.stringify(body),
//       });
//       const data = await response.json();
//       return Response.json(data, { status: response.status });
//     },
//   },
// };










import { createAuthClient } from "better-auth/react";

// Client-side auth client (for React components)
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

// Export client-side hooks and methods
export const { useSession, signIn, signOut, signUp } = authClient;


