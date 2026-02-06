'use client';

import { cn } from '@/lib/utils';
import { motion, easeInOut , type HTMLMotionProps } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  animation?: 'pulse' | 'none';
  variant?: 'default' | 'rounded' | 'circle';
  width?: string | number;
  height?: string | number;
  delay?: number;
}

const Skeleton = ({
  className,
  animation = 'pulse',
  variant = 'rounded',
  width,
  height,
  delay = 0,
  ...props
}: HTMLMotionProps<'div'> & SkeletonProps) => {

  // Animation variants for different loading states
  const animationVariants: Record<'pulse' | 'none', Variants> = {
    pulse: {
      initial: { opacity: 0.6 },
      animate: {
        opacity: [0.6, 0.9, 0.6],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: easeInOut,
          delay
        }
      }
    },
    none: {
      initial: { opacity: 0.6 },
      animate: { opacity: 0.6 }
    }
  };

  const variantClasses = {
    default: 'rounded-none',
    rounded: 'rounded-md',
    circle: 'rounded-full'
  };

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <motion.div
      variants={animationVariants[animation]}
      initial="initial"
      animate="animate"
      className={cn(
        'bg-gray-200/70 dark:bg-gray-700/70',
        variantClasses[variant],
        className
      )}
      style={style}
      {...props}
    />
  );
};

export { Skeleton };