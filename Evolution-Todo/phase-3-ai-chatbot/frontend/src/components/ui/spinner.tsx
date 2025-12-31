'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { loadingAnimation } from '@/lib/animations';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  const sizeClass = sizeClasses[size];

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={cn(
          'rounded-full border-4 border-transparent',
          'border-t-primary border-r-primary border-b-transparent border-l-transparent',
          sizeClass,
          className
        )}
        {...loadingAnimation}
      />
    </div>
  );
};

export { Spinner };