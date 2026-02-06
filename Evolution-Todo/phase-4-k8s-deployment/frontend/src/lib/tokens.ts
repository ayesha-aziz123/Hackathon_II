/**
 * Design tokens for the Todo App design system
 * Consolidated tokens for colors, spacing, typography, and other design properties
 * Based on the design system specifications in design-system.md
 */

import { colorPalette } from './colors';
import { spacing, spacingPx } from './spacing';
import { typography, fontSize, lineHeight, fontWeight } from './typography';
import { backgroundGradients, textGradients, borderGradients } from './gradients';
import { glassmorphism } from './styles';

// Design tokens consolidated object
export const designTokens = {
  // Color tokens
  color: {
    primary: colorPalette.primary,
    secondary: colorPalette.secondary,
    status: colorPalette.status,
    background: colorPalette.background,
    surface: colorPalette.surface,
    card: colorPalette.card,
    glass: colorPalette.glass,
    neutral: colorPalette.neutral,
  },

  // Spacing tokens
  spacing: {
    scale: spacing,
    scalePx: spacingPx,
    config: {
      component: {
        padding: spacing[4],      // 16px standard padding
        margin: spacing[6],       // 24px between components
        gap: spacing[3],          // 12px internal gaps
      },
      layout: {
        container: spacing[9],    // 48px container padding
        section: spacing[10],     // 64px section spacing
        grid: spacing[4],         // 16px grid gap
      },
      form: {
        fieldSpacing: spacing[3], // 12px between form fields
        labelSpacing: spacing[2], // 8px between label and field
        buttonSpacing: spacing[4], // 16px around buttons
      },
      card: {
        padding: spacing[6],      // 24px card padding
        gap: spacing[4],          // 16px card content gap
        margin: spacing[7],       // 32px between cards
      },
      button: {
        paddingX: spacing[4],     // 16px horizontal padding
        paddingY: spacing[2],     // 8px vertical padding
        gap: spacing[3],          // 12px between icon and text
        margin: spacing[2],       // 8px between buttons
      },
    },
  },

  // Typography tokens
  typography: {
    fontSize,
    lineHeight,
    fontWeight,
    styles: typography,
  },

  // Gradient tokens
  gradient: {
    background: backgroundGradients,
    text: textGradients,
    border: borderGradients,
  },

  // Glassmorphism tokens
  glass: glassmorphism,

  // Border radius tokens
  borderRadius: {
    none: '0px',
    sm: '0.125rem',    // 2px
    default: '0.25rem', // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px',    // Full circle
  },

  // Shadow tokens
  shadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },

  // Animation tokens
  animation: {
    duration: {
      fastest: '50ms',
      faster: '100ms',
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '400ms',
      slowest: '500ms',
    },
    easing: {
      linear: 'cubic-bezier(0, 0, 1, 1)',
      inSine: 'cubic-bezier(0.12, 0, 0.39, 0)',
      outSine: 'cubic-bezier(0.61, 1, 0.88, 1)',
      inOutSine: 'cubic-bezier(0.37, 0, 0.63, 1)',
      inQuad: 'cubic-bezier(0.11, 0, 0.5, 0)',
      outQuad: 'cubic-bezier(0.5, 1, 0.89, 1)',
      inOutQuad: 'cubic-bezier(0.45, 0, 0.55, 1)',
      inCubic: 'cubic-bezier(0.32, 0, 0.67, 0)',
      outCubic: 'cubic-bezier(0.33, 1, 0.68, 1)',
      inOutCubic: 'cubic-bezier(0.65, 0, 0.35, 1)',
      inQuart: 'cubic-bezier(0.5, 0, 0.75, 0)',
      outQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
      inOutQuart: 'cubic-bezier(0.76, 0, 0.24, 1)',
      inQuint: 'cubic-bezier(0.64, 0, 0.78, 0)',
      outQuint: 'cubic-bezier(0.22, 1, 0.36, 1)',
      inOutQuint: 'cubic-bezier(0.83, 0, 0.17, 1)',
      inExpo: 'cubic-bezier(0.7, 0, 0.84, 0)',
      outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
      inOutExpo: 'cubic-bezier(0.87, 0, 0.13, 1)',
      inCirc: 'cubic-bezier(0.55, 0, 1, 0.45)',
      outCirc: 'cubic-bezier(0, 0.55, 0.45, 1)',
      inOutCirc: 'cubic-bezier(0.85, 0, 0.15, 1)',
      inBack: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
      outBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      inOutBack: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    },
    transition: {
      default: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      ease: 'all 200ms ease',
      linear: 'all 200ms linear',
      fast: 'all 100ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Z-index tokens
  zIndex: {
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    dropdown: '1000',
    sticky: '1100',
    fixed: '1200',
    overlay: '1300',
    modal: '1400',
    popover: '1500',
    skipLink: '1600',
    toast: '1700',
    tooltip: '1800',
  },

  // Breakpoint tokens
  breakpoint: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Opacity tokens
  opacity: {
    0: '0',
    5: '0.05',
    10: '0.1',
    20: '0.2',
    25: '0.25',
    30: '0.3',
    40: '0.4',
    50: '0.5',
    60: '0.6',
    70: '0.7',
    75: '0.75',
    80: '0.8',
    90: '0.9',
    95: '0.95',
    100: '1',
  },
} as const;

// Utility functions to access design tokens
export const getToken = <T extends keyof typeof designTokens>(
  category: T,
  tokenName?: keyof typeof designTokens[T]
): typeof designTokens[T] | typeof designTokens[T][keyof typeof designTokens[T]] => {
  if (tokenName) {
    return designTokens[category][tokenName as keyof typeof designTokens[T]];
  }
  return designTokens[category];
};

// Type definitions for better TypeScript support
export type DesignTokens = typeof designTokens;
export type ColorTokens = typeof designTokens.color;
export type SpacingTokens = typeof designTokens.spacing;
export type TypographyTokens = typeof designTokens.typography;
export type GradientTokens = typeof designTokens.gradient;
export type GlassTokens = typeof designTokens.glass;
export type BorderRadiusTokens = typeof designTokens.borderRadius;
export type ShadowTokens = typeof designTokens.shadow;
export type AnimationTokens = typeof designTokens.animation;
export type ZIndexTokens = typeof designTokens.zIndex;
export type BreakpointTokens = typeof designTokens.breakpoint;
export type OpacityTokens = typeof designTokens.opacity;