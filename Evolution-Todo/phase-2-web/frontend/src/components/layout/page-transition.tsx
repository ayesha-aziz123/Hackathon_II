'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import { useTransition } from '@/contexts/transition-context';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type TransitionType = 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideFromRight';

interface PageTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  key?: string;
  className?: string;
}

const transition = {
  duration: 0.3,
  ease: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number],
};

const PageTransition = ({
  children,
  type,
  key,
  className = ''
}: PageTransitionProps) => {
  // Use the transition type from context if not provided as prop
  const { transitionType: contextTransitionType } = useTransition();
  const effectiveType = type || contextTransitionType;

  // Check if user prefers reduced motion
  const prefersReducedMotion = useReducedMotion();

  const getVariants = () => {
    // If user prefers reduced motion, return no animation variants
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
      };
    }

    switch (effectiveType) {
      case 'slide':
        return {
          initial: { opacity: 0, x: 20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -20 },
        };
      case 'slideFromRight':
        return {
          initial: { opacity: 0, x: 20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 20 },
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
        };
      case 'slideUp':
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  const variants = getVariants();

  // Accessibility: Announce page changes to screen readers
  useEffect(() => {
    const announceToScreenReader = () => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = 'Page content updated';

      document.body.appendChild(announcement);

      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    };

    announceToScreenReader();
  }, [key]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={transition}
        className={`w-full h-full ${className}`}
        role="main"
        aria-label="Main content"
        // Ensure proper tab indexing for accessibility
        tabIndex={-1}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;