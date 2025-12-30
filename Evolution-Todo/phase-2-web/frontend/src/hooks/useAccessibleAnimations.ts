import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useEffect, useState } from 'react';

/**
 * Accessibility utility hook for animated components
 * Provides utilities to make animations more accessible
 */
export const useAccessibleAnimations = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to announce changes to screen readers
  const announceToScreenReader = (message: string) => {
    if (typeof window !== 'undefined') {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.style.position = 'absolute';
      announcement.style.left = '-9999px';
      announcement.textContent = message;

      document.body.appendChild(announcement);

      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  };

  return {
    prefersReducedMotion,
    isClient,
    announceToScreenReader,
    // Get appropriate animation props based on user preferences
    getAnimationProps: (defaultProps: any) => {
      if (prefersReducedMotion) {
        return {
          transition: { duration: 0 },
          // Return static state when reduced motion is preferred
          ...defaultProps
        };
      }
      return defaultProps;
    }
  };
};