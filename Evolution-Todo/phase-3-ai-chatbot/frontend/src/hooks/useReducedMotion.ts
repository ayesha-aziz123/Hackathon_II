import { useState, useEffect } from 'react';

/**
 * Custom hook to detect user's preference for reduced motion
 * @returns boolean indicating if user prefers reduced motion
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      // Create media query for reduced motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      // Set initial value
      setPrefersReducedMotion(mediaQuery.matches);

      // Add event listener for changes
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      // Add listener using addEventListener (modern approach)
      mediaQuery.addEventListener('change', handleChange);

      // Cleanup function to remove event listener
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  return prefersReducedMotion;
};