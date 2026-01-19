import { useState, useEffect } from 'react';

/**
 * Custom hook to detect device performance and adjust animations accordingly
 * Helps optimize animations for lower-end devices (T071)
 */
export const usePerformanceAwareAnimation = () => {
  const [isHighPerformance, setIsHighPerformance] = useState(true);

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      // Check for device memory (if available)
      const deviceMemory = (navigator as any).deviceMemory; // Not standard but available in some browsers

      // Check for hardware concurrency (number of CPU cores)
      const hardwareConcurrency = navigator.hardwareConcurrency || 4; // Default to 4

      // Check for connection type (if available)
      const connection = (navigator as any).connection;
      const effectiveType = connection ? connection.effectiveType : '4g';

      // Determine if device is high performance based on heuristics
      const hasHighMemory = !deviceMemory || deviceMemory >= 4; // 4GB+ is good
      const hasManyCores = hardwareConcurrency >= 4;
      const hasGoodConnection = ['4g', '5g', 'wifi'].includes(effectiveType);

      // For lower-end devices, disable or simplify animations
      setIsHighPerformance(hasHighMemory && hasManyCores && hasGoodConnection);
    }
  }, []);

  return {
    isHighPerformance,
    // Get animation settings based on device performance
    getAnimationSettings: (highPerfSettings: any, lowPerfSettings: any) => {
      return isHighPerformance ? highPerfSettings : lowPerfSettings;
    },
    // Check if animations should be simplified
    shouldSimplifyAnimations: !isHighPerformance
  };
};