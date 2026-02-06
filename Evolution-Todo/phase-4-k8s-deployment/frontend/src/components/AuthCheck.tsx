// frontend/src/components/AuthCheck.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/sign-in");
    }
  }, [router]);

  if (!auth.isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Checking authentication...</div>
      </div>
    );
  }

  return <>{children}</>;
}