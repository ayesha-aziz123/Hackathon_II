import { Variants } from 'framer-motion';

// Animation timing and easing presets
export const ANIMATION_PRESETS = {
  // Standard durations
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,

  // Easing curves
  easeOut: [0.33, 1, 0.68, 1] as const,
  easeInOut: [0.65, 0, 0.35, 1] as const,
  easeIn: [0.32, 0, 0.67, 0] as const,
  spring: {
    type: 'spring',
    damping: 25,
    stiffness: 300
  }
} as const;

// Common animation variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_PRESETS.normal,
      ease: ANIMATION_PRESETS.easeOut
    }
  }
};

export const slideInFromLeft: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_PRESETS.normal,
      ease: ANIMATION_PRESETS.easeOut
    }
  }
};

export const slideInFromRight: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_PRESETS.normal,
      ease: ANIMATION_PRESETS.easeOut
    }
  }
};

export const slideInFromTop: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_PRESETS.normal,
      ease: ANIMATION_PRESETS.easeOut
    }
  }
};

export const slideInFromBottom: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_PRESETS.normal,
      ease: ANIMATION_PRESETS.easeOut
    }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_PRESETS.normal,
      ease: ANIMATION_PRESETS.easeOut
    }
  }
};

// Animation presets for common UI elements
export const cardHover = {
  hover: {
    y: -5,
    transition: {
      duration: ANIMATION_PRESETS.fast,
      ease: ANIMATION_PRESETS.easeOut
    }
  }
};

export const buttonHover = {
  hover: {
    scale: 1.05,
    transition: {
      duration: ANIMATION_PRESETS.fast,
      ease: ANIMATION_PRESETS.easeOut
    }
  },
  tap: {
    scale: 0.95
  }
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      ...ANIMATION_PRESETS.spring
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: ANIMATION_PRESETS.fast
    }
  }
};

// Performance optimized animations
export const optimizedFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: ANIMATION_PRESETS.normal, ease: ANIMATION_PRESETS.easeOut }
  },
};

export const optimizedSlideIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: ANIMATION_PRESETS.normal, ease: ANIMATION_PRESETS.easeOut }
  }
};

// Animation variants for loading states
export const loadingAnimation = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear" as const
    }
  }
};
