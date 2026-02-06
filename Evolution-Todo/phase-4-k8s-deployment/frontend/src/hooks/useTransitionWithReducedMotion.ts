import { useReducedMotion } from './useReducedMotion';
import { useTransition } from '@/contexts/transition-context';

/**
 * Custom hook that combines transition context with reduced motion preferences
 * @returns Object containing transition type and reduced motion preference
 */
export const useTransitionWithReducedMotion = () => {
  const { transitionType } = useTransition();
  const prefersReducedMotion = useReducedMotion();

  return {
    transitionType,
    prefersReducedMotion,
    // If user prefers reduced motion, return 'none' or the original type
    effectiveTransitionType: prefersReducedMotion ? 'fade' as const : transitionType
  };
};