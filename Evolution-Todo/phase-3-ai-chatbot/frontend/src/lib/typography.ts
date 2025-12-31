/**
 * Typography system for the Todo App design system
 * Based on the design system specifications in design-system.md
 */

// Font stack definitions
export const fontStack = {
  primary: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fallback: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  monospace: '"SF Mono", "Monaco", "Consolas", "Ubuntu Mono", monospace',
} as const;

// Font scale definitions
export const fontSize = {
  // Display sizes
  display1: '3.5rem',    // 56px
  display2: '2.75rem',   // 44px
  display3: '2.25rem',   // 36px

  // Heading sizes
  h1: '2rem',           // 32px
  h2: '1.75rem',        // 28px
  h3: '1.5rem',         // 24px
  h4: '1.25rem',        // 20px
  h5: '1.125rem',       // 18px
  h6: '1rem',           // 16px

  // Body sizes
  bodyLarge: '1.125rem', // 18px
  body: '1rem',          // 16px
  bodySmall: '0.875rem', // 14px

  // Caption sizes
  caption: '0.75rem',    // 12px
} as const;

// Line height definitions
export const lineHeight = {
  display1: '4rem',      // 64px
  display2: '3.25rem',   // 52px
  display3: '2.75rem',   // 44px

  h1: '2.5rem',         // 40px
  h2: '2.25rem',        // 36px
  h3: '2rem',           // 32px
  h4: '1.75rem',        // 28px
  h5: '1.75rem',        // 28px
  h6: '1.5rem',         // 24px

  bodyLarge: '1.75rem', // 28px
  body: '1.5rem',       // 24px
  bodySmall: '1.25rem', // 20px

  caption: '1rem',      // 16px
} as const;

// Font weight definitions
export const fontWeight = {
  thin: 100,
  extraLight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
  black: 900,
} as const;

// Typography styles
export const typography = {
  // Heading styles
  heading: {
    display1: {
      fontSize: fontSize.display1,
      lineHeight: lineHeight.display1,
      fontWeight: fontWeight.bold,
      letterSpacing: '-0.02em',
    },
    display2: {
      fontSize: fontSize.display2,
      lineHeight: lineHeight.display2,
      fontWeight: fontWeight.bold,
      letterSpacing: '-0.015em',
    },
    display3: {
      fontSize: fontSize.display3,
      lineHeight: lineHeight.display3,
      fontWeight: fontWeight.bold,
      letterSpacing: '-0.01em',
    },
    h1: {
      fontSize: fontSize.h1,
      lineHeight: lineHeight.h1,
      fontWeight: fontWeight.semiBold,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: fontSize.h2,
      lineHeight: lineHeight.h2,
      fontWeight: fontWeight.semiBold,
      letterSpacing: '0',
    },
    h3: {
      fontSize: fontSize.h3,
      lineHeight: lineHeight.h3,
      fontWeight: fontWeight.semiBold,
      letterSpacing: '0',
    },
    h4: {
      fontSize: fontSize.h4,
      lineHeight: lineHeight.h4,
      fontWeight: fontWeight.semiBold,
      letterSpacing: '0.01em',
    },
    h5: {
      fontSize: fontSize.h5,
      lineHeight: lineHeight.h5,
      fontWeight: fontWeight.medium,
      letterSpacing: '0.01em',
    },
    h6: {
      fontSize: fontSize.h6,
      lineHeight: lineHeight.h6,
      fontWeight: fontWeight.medium,
      letterSpacing: '0.015em',
    },
  },

  // Body text styles
  body: {
    large: {
      fontSize: fontSize.bodyLarge,
      lineHeight: lineHeight.bodyLarge,
      fontWeight: fontWeight.regular,
    },
    regular: {
      fontSize: fontSize.body,
      lineHeight: lineHeight.body,
      fontWeight: fontWeight.regular,
    },
    small: {
      fontSize: fontSize.bodySmall,
      lineHeight: lineHeight.bodySmall,
      fontWeight: fontWeight.regular,
    },
  },

  // Caption styles
  caption: {
    default: {
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      fontWeight: fontWeight.medium,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
  },
} as const;

// Responsive typography scales
export const responsiveTypography = {
  // Mobile first scaling
  mobile: {
    display1: '2.5rem',
    display2: '2.25rem',
    display3: '1.875rem',
    h1: '1.75rem',
    h2: '1.5rem',
    h3: '1.25rem',
    h4: '1.125rem',
    h5: '1rem',
    h6: '0.875rem',
    bodyLarge: '1rem',
    body: '0.875rem',
    bodySmall: '0.75rem',
    caption: '0.625rem',
  },
  tablet: {
    display1: '3rem',
    display2: '2.5rem',
    display3: '2rem',
    h1: '1.875rem',
    h2: '1.5rem',
    h3: '1.25rem',
    h4: '1.125rem',
    h5: '1rem',
    h6: '0.875rem',
    bodyLarge: '1.125rem',
    body: '1rem',
    bodySmall: '0.875rem',
    caption: '0.75rem',
  },
  desktop: {
    ...fontSize,
  },
} as const;

// Utility functions for typography
export const getTypographyClass = (type: keyof typeof typography): string => {
  const styles = typography[type as keyof typeof typography];
  if (styles && typeof styles === 'object') {
    return Object.keys(styles)
      .map(key => `${type}-${key}`)
      .join(' ');
  }
  return `${type}`;
};

// Type definitions for better TypeScript support
export type FontSize = keyof typeof fontSize;
export type FontWeight = keyof typeof fontWeight;
export type TypographyType = keyof typeof typography;