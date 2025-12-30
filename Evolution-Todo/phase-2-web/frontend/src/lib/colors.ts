/**
 * Color palette for the Todo App design system
 * Based on the design system specifications in design-system.md
 */

// Primary Color Palette
export const primary = {
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9', // main primary
  600: '#0284c7', // darker
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e', // darkest
} as const;

// Secondary Color Palette
export const secondary = {
  50: '#f5f3ff',
  100: '#ede9fe',
  200: '#ddd6fe',
  300: '#c4b5fd',
  400: '#a78bfa',
  500: '#8b5cf6', // main secondary
  600: '#7c3aed',
  700: '#6d28d9',
  800: '#5b21b6',
  900: '#4c1d95',
} as const;

// Status Colors
export const status = {
  success: '#10b981', // emerald
  warning: '#f59e0b', // amber
  error: '#ef4444', // red
  info: '#3b82f6', // blue
  neutral: '#6b7280', // gray
} as const;

// Background & Surface Colors
export const background = {
  light: '#f9fafb', // gray-50
  dark: '#0f172a', // slate-900
} as const;

export const surface = {
  light: '#ffffff', // white
  dark: '#1e293b', // slate-800
} as const;

export const card = {
  light: '#ffffff', // with glass effect
  dark: '#334155', // slate-700, with glass effect
} as const;

// Glassmorphism Colors
export const glass = {
  light: 'rgba(255, 255, 255, 0.75)', // with backdrop-filter
  dark: 'rgba(30, 41, 59, 0.75)', // with backdrop-filter
  borderLight: 'rgba(255, 255, 255, 0.18)', // for light theme
  borderDark: 'rgba(255, 255, 255, 0.1)', // for dark theme
} as const;

// Neutral Colors
export const neutral = {
  50: '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',
} as const;

// Export color palette as Tailwind theme extension
export const colorPalette = {
  primary,
  secondary,
  status,
  background,
  surface,
  card,
  glass,
  neutral,
};

// Type definitions for better TypeScript support
export type ColorPalette = typeof colorPalette;
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;