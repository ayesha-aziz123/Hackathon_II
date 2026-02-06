/**
 * Spacing system for the Todo App design system
 * Based on the design system specifications in design-system.md
 */

// Base unit: 4px (0.25rem)
export const baseUnit = 4; // pixels

// Spacing scale - Powers of 2 (1, 2, 4, 8, 16, 24, 32, 48, 64, 80, 96)
export const spacing = {
  1: '0.25rem', // 4px - micro spacing
  2: '0.5rem',  // 8px - component padding
  3: '0.75rem', // 12px - small element spacing
  4: '1rem',    // 16px - standard component spacing
  5: '1.25rem', // 20px - section padding
  6: '1.5rem',  // 24px - medium element spacing
  7: '2rem',    // 32px - large element spacing
  8: '2.5rem',  // 40px - section spacing
  9: '3rem',    // 48px - container padding
  10: '4rem',   // 64px - large section spacing
  11: '5rem',   // 80px - extra large spacing
  12: '6rem',   // 96px - maximum spacing
} as const;

// Spacing values in pixels for programmatic use
export const spacingPx = {
  1: 4,   // 4px - micro spacing
  2: 8,   // 8px - component padding
  3: 12,  // 12px - small element spacing
  4: 16,  // 16px - standard component spacing
  5: 20,  // 20px - section padding
  6: 24,  // 24px - medium element spacing
  7: 32,  // 32px - large element spacing
  8: 40,  // 40px - section spacing
  9: 48,  // 48px - container padding
  10: 64, // 64px - large section spacing
  11: 80, // 80px - extra large spacing
  12: 96, // 96px - maximum spacing
} as const;

// Responsive spacing multipliers
export const responsiveSpacing = {
  mobile: 1,
  tablet: 1.25,
  desktop: 1.5,
  largeDesktop: 2,
} as const;

// Spacing utility functions
export const getResponsiveSpacing = (
  size: keyof typeof spacing,
  device: keyof typeof responsiveSpacing = 'mobile'
): string => {
  const baseSpacing = spacing[size];
  const multiplier = responsiveSpacing[device];

  // Convert rem to pixels and multiply, then convert back to rem
  const baseValue = parseFloat(baseSpacing);
  const newValue = baseValue * multiplier;

  return `${newValue}rem`;
};

// Padding utility functions
export const getPadding = (
  size: keyof typeof spacing,
  direction?: 'x' | 'y' | 't' | 'r' | 'b' | 'l'
): string => {
  switch (direction) {
    case 'x':
      return `px-${size}`;
    case 'y':
      return `py-${size}`;
    case 't':
      return `pt-${size}`;
    case 'r':
      return `pr-${size}`;
    case 'b':
      return `pb-${size}`;
    case 'l':
      return `pl-${size}`;
    default:
      return `p-${size}`;
  }
};

// Margin utility functions
export const getMargin = (
  size: keyof typeof spacing,
  direction?: 'x' | 'y' | 't' | 'r' | 'b' | 'l'
): string => {
  switch (direction) {
    case 'x':
      return `mx-${size}`;
    case 'y':
      return `my-${size}`;
    case 't':
      return `mt-${size}`;
    case 'r':
      return `mr-${size}`;
    case 'b':
      return `mb-${size}`;
    case 'l':
      return `ml-${size}`;
    default:
      return `m-${size}`;
  }
};

// Gap utility functions
export const getGap = (size: keyof typeof spacing): string => {
  return `gap-${size}`;
};

// Spacing configuration for different contexts
export const spacingConfig = {
  // Component internal spacing
  component: {
    padding: spacing[4],      // 16px standard padding
    margin: spacing[6],       // 24px between components
    gap: spacing[3],          // 12px internal gaps
  },

  // Layout spacing
  layout: {
    container: spacing[9],    // 48px container padding
    section: spacing[10],     // 64px section spacing
    grid: spacing[4],         // 16px grid gap
  },

  // Form element spacing
  form: {
    fieldSpacing: spacing[3], // 12px between form fields
    labelSpacing: spacing[2], // 8px between label and field
    buttonSpacing: spacing[4], // 16px around buttons
  },

  // Card spacing
  card: {
    padding: spacing[6],      // 24px card padding
    gap: spacing[4],          // 16px card content gap
    margin: spacing[7],       // 32px between cards
  },

  // Button spacing
  button: {
    paddingX: spacing[4],     // 16px horizontal padding
    paddingY: spacing[2],     // 8px vertical padding
    gap: spacing[3],          // 12px between icon and text
    margin: spacing[2],       // 8px between buttons
  },
} as const;

// Breakpoint-specific spacing
export const breakpointSpacing = {
  // Mobile spacing (320px - 767px)
  mobile: {
    containerPadding: spacing[4],  // 16px with 16px horizontal padding
    sectionSpacing: spacing[7],    // 32px between sections
    componentSpacing: spacing[5],  // 20px between components
  },

  // Tablet spacing (768px - 1023px)
  tablet: {
    containerPadding: spacing[6],  // 24px horizontal padding
    sectionSpacing: spacing[8],    // 40px between sections
    componentSpacing: spacing[6],  // 24px between components
  },

  // Desktop spacing (1024px - 1439px)
  desktop: {
    containerPadding: spacing[7],  // 32px horizontal padding
    sectionSpacing: spacing[10],   // 64px between sections
    componentSpacing: spacing[7],  // 32px between components
  },

  // Large Desktop spacing (1440px+)
  largeDesktop: {
    containerPadding: spacing[9],  // 48px horizontal padding
    sectionSpacing: spacing[11],   // 80px between sections
    componentSpacing: spacing[9],  // 48px between components
  },
} as const;

// Type definitions for better TypeScript support
export type SpacingScale = keyof typeof spacing;
export type SpacingDirection = 'x' | 'y' | 't' | 'r' | 'b' | 'l';
export type Breakpoint = keyof typeof breakpointSpacing;