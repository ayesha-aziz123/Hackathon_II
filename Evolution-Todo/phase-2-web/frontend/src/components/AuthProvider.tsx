// 'use client';

// import { createContext, useContext, ReactNode } from 'react';
// import { createAuthClient } from 'better-auth/react';

// // Create auth client instance
// const authClient = createAuthClient({
//   baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
// });

// interface AuthContextType {
//   user: any;
//   isAuthenticated: boolean;
//   isLoading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const { data: session, isPending, error } = authClient.useSession();

//   const value = {
//     user: session?.user || null,
//     isAuthenticated: !!session,
//     isLoading: isPending,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuthContext() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuthContext must be used within an AuthProvider');
//   }
//   return context;
// }












"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from '@/lib/auth';

interface AuthContextType {
  user: any;
  loading: boolean;  // ✅ Changed from isLoading to loading
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  return (
    <AuthContext.Provider 
      value={{ 
        user: session?.user ?? null, 
        loading: isPending  // ✅ Changed to loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
