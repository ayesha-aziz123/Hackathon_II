"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useSession as useBetterAuthSession } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Session {
  user: User;
  access_token: string;
}

interface CustomSessionContextType {
  data: Session | null;
  loading: boolean;
  update: (newSession: Partial<Session>) => void;
}

const CustomSessionContext = createContext<
  CustomSessionContextType | undefined
>(undefined);

export const CustomSessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: betterAuthSession, isLoading } = useBetterAuthSession();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Wrap setSession in a micro-task to avoid sync effect issue
    if (betterAuthSession && betterAuthSession.user) {
      queueMicrotask(() => {
        const user = {
          id: betterAuthSession.user.id,
          email: betterAuthSession.user.email,
          name: betterAuthSession.user.name,
        };

        // For our custom auth, we can use the token from localStorage
        const storedToken = localStorage.getItem("auth_token") || "";

        setSession({ user, access_token: storedToken });
      });
    } else {
      queueMicrotask(() => setSession(null));
    }
  }, [betterAuthSession]);

  const updateSession = (newSession: Partial<Session>) => {
    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...newSession,
        user: {
          ...prev.user,
          ...(newSession.user || {}),
        },
      };
    });
  };

  return (
    <CustomSessionContext.Provider
      value={{ data: session, loading: isLoading, update: updateSession }}
    >
      {children}
    </CustomSessionContext.Provider>
  );
};

export const useCustomSession = (): CustomSessionContextType => {
  const context = useContext(CustomSessionContext);
  if (context === undefined) {
    throw new Error(
      "useCustomSession must be used within a CustomSessionProvider"
    );
  }
  return context;
};
