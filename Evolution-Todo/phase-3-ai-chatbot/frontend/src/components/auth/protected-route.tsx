'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthLoading } from './auth-loading';
import { useSession } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute = ({ children, fallback }: ProtectedRouteProps) => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.push('/(auth)/sign-in');
      } else {
        setIsChecking(false);
      }
    }
  }, [session, isPending, router]);

  if (isChecking || isPending) {
    return fallback || <AuthLoading message="Checking authentication..." />;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export { ProtectedRoute };