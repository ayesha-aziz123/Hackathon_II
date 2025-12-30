"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useSession as useBetterAuthSession } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  preferences?: {
    theme?: string;
    notifications?: boolean;
    language?: string;
    timezone?: string;
  };
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
  const { data: betterAuthSession, isPending } = useBetterAuthSession();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Wrap setSession in a micro-task to avoid sync effect issue
    if (betterAuthSession) {
      queueMicrotask(() => {
        const user = {
          id: betterAuthSession.user.id,
          email: betterAuthSession.user.email,
          name: betterAuthSession.user.name,
          created_at: betterAuthSession.user.createdAt.toISOString(),
          updated_at: betterAuthSession.user.updatedAt.toISOString(),
          is_active: true,
          preferences: {},
        };

        let access_token: string = "";

        if (
          "accessToken" in betterAuthSession &&
          typeof betterAuthSession.accessToken === "string"
        ) {
          access_token = betterAuthSession.accessToken;
        } else if (
          "token" in betterAuthSession &&
          typeof betterAuthSession.token === "string"
        ) {
          access_token = betterAuthSession.token;
        } else {
          access_token = "";
        }

        setSession({ user, access_token });
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
      value={{ data: session, loading: isPending, update: updateSession }}
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
