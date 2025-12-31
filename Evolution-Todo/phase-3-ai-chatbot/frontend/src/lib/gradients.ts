/**
 * Gradient definitions for the Todo App design system
 * Based on the design system specifications in design-system.md
 */

import { primary, secondary } from './colors';

// Background gradients
export const backgroundGradients = {
  // Primary background gradient
  primary: `linear-gradient(135deg, ${primary[400]} 0%, ${primary[600]} 100%)`,

  // Secondary background gradient
  secondary: `linear-gradient(135deg, ${secondary[400]} 0%, ${secondary[600]} 100%)`,

  // Background gradient from design system
  background: `linear-gradient(135deg, ${primary[500]} 0%, ${secondary[500]} 100%)`,

  // Subtle gradient for depth
  subtle: `linear-gradient(135deg, ${primary[100]} 0%, ${secondary[100]} 100%)`,

  // Card gradient for depth
  card: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`,
} as const;

// Text gradients
export const textGradients = {
  // Primary text gradient
  primary: `linear-gradient(90deg, ${primary[500]} 0%, ${primary[700]} 100%)`,

  // Secondary text gradient
  secondary: `linear-gradient(90deg, ${secondary[500]} 0%, ${secondary[700]} 100%)`,

  // Accent text gradient
  accent: `linear-gradient(90deg, ${primary[500]} 0%, ${secondary[500]} 100%)`,

  // Heading text gradient
  heading: `linear-gradient(135deg, ${primary[500]} 0%, ${secondary[500]} 100%)`,
} as const;

// Border gradients
export const borderGradients = {
  // Primary border gradient
  primary: `linear-gradient(90deg, ${primary[400]} 0%, ${primary[600]} 100%)`,

  // Secondary border gradient
  secondary: `linear-gradient(90deg, ${secondary[400]} 0%, ${secondary[600]} 100%)`,

  // Accent border gradient
  accent: `linear-gradient(90deg, ${primary[500]} 0%, ${secondary[500]} 100%)`,
} as const;

// Utility functions for creating gradients
export const createGradient = (
  direction: string = 'to right',
  colors: string[],
  stops?: (string | number)[]
): string => {
  if (stops && stops.length === colors.length) {
    return `linear-gradient(${direction}, ${colors.map((color, index) => `${color} ${stops[index]}`).join(', ')})`;
  }
  return `linear-gradient(${direction}, ${colors.join(', ')})`;
};

// Gradient background utility
export const gradientBackground = (
  gradient: keyof typeof backgroundGradients,
  className: string = ''
): string => {
  return `bg-gradient-to-br from-[${primary[400]}] to-[${primary[600]}] ${className}`;
};

// Text gradient utility
export const gradientText = (
  gradient: keyof typeof textGradients,
  className: string = ''
): string => {
  return `bg-clip-text text-transparent bg-gradient-to-r from-[${primary[500]}] to-[${secondary[500]}] ${className}`;
};

// Border gradient utility
export const gradientBorder = (
  gradient: keyof typeof borderGradients,
  className: string = ''
): string => {
  return `border border-transparent [border-image:linear-gradient(90deg,${primary[400]},${primary[600]})_1] ${className}`;
};

// Gradient class names for Tailwind CSS
export const gradientClasses = {
  // Background gradients
  bgPrimary: 'bg-gradient-to-br from-blue-400 to-blue-600',
  bgSecondary: 'bg-gradient-to-br from-purple-400 to-purple-600',
  bgAccent: 'bg-gradient-to-br from-blue-500 to-purple-500',
  bgSubtle: 'bg-gradient-to-br from-blue-100 to-purple-100',

  // Text gradients
  textPrimary: 'bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent',
  textSecondary: 'bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent',
  textAccent: 'bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent',
  textHeading: 'bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent',
} as const;

// Type definitions for better TypeScript support
export type BackgroundGradient = keyof typeof backgroundGradients;
export type TextGradient = keyof typeof textGradients;
export type BorderGradient = keyof typeof borderGradients;