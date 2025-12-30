"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from '@/lib/auth';

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
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
