'use client';

import { motion } from 'framer-motion';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface AuthLoadingProps {
  message?: string;
  className?: string;
}

const AuthLoading = ({ message = 'Loading...', className }: AuthLoadingProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'flex flex-col items-center justify-center min-h-[60vh] space-y-4',
        className
      )}
    >
      <Spinner size="lg" />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-muted-foreground"
      >
        {message}
      </motion.p>
    </motion.div>
  );
};

export { AuthLoading };