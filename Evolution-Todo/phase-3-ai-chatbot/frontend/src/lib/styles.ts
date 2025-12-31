/**
 * Design system styles and utility functions
 * Contains reusable style definitions and theme-aware styling functions
 */

// Glassmorphism style definitions
export const  glassmorphism = {
  card: "bg-white/10 backdrop-blur-lg border border-white/20 dark:bg-gray-800/80 dark:border-gray-700/50",
  panel: "bg-white/15 backdrop-blur-md border border-white/25 dark:bg-gray-800/60 dark:border-gray-600/40",
  menu: "bg-white/20 backdrop-blur-xl border border-white/30 dark:bg-gray-800/90 dark:border-gray-700/60",
  button: "bg-white/10 backdrop-blur-sm border border-white/15 dark:bg-gray-700/50 dark:border-gray-600/30",
  input: "bg-white/10 backdrop-blur-sm border border-white/20 dark:bg-gray-800/40 dark:border-gray-700/40",
  modal: "bg-white/15 backdrop-blur-xl border border-white/20 text-foreground",
};

// Animation style definitions
export const animations = {
  fadeIn: "animate-in fade-in duration-200",
  slideUp: "animate-in slide-in-from-bottom-4 duration-200",
  slideDown: "animate-in slide-in-from-top-4 duration-200",
  scaleIn: "animate-in zoom-in-95 duration-200",
  scaleOut: "animate-out zoom-out-95 duration-200",
};

// Shadow style definitions
export const shadows = {
  soft: "shadow-sm shadow-black/5",
  medium: "shadow-md shadow-black/10",
  large: "shadow-lg shadow-black/15",
  glass: "shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]",
  hover: "hover:shadow-lg hover:shadow-black/15 transition-shadow duration-200",
};

// Border style definitions
export const borders = {
  subtle: "border border-gray-200/60 dark:border-gray-700/50",
  standard: "border border-gray-300 dark:border-gray-600",
  strong: "border-2 border-gray-400 dark:border-gray-500",
  glass: "border border-white/20 dark:border-gray-700/40",
};

// Gradient style definitions
export const gradients = {
  subtle: "bg-gradient-to-br from-transparent to-transparent",
  soft: "bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-900/5 dark:to-gray-800/10",
  primary: "bg-gradient-to-br from-primary/10 to-primary/5",
  accent: "bg-gradient-to-br from-accent/10 to-accent/5",
  glass: "bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-800/10 dark:to-gray-900/5",
};

// Responsive breakpoints
export const breakpoints = {
  sm: "min-[640px]",
  md: "min-[768px]",
  lg: "min-[1024px]",
  xl: "min-[1280px]",
  "2xl": "min-[1536px]",
};