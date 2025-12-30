# Design System Specifications: Frontend UI Redesign

## Overview
This document defines the comprehensive design system for the Todo App frontend UI redesign, including color palette, typography, spacing, and visual elements that create a cohesive, modern, and animated user interface.

## Color System

### Primary Color Palette
- **Primary 50**: #f0f9ff (lightest)
- **Primary 100**: #e0f2fe
- **Primary 200**: #bae6fd
- **Primary 300**: #7dd3fc
- **Primary 400**: #38bdf8
- **Primary 500**: #0ea5e9 (main primary)
- **Primary 600**: #0284c7 (darker)
- **Primary 700**: #0369a1
- **Primary 800**: #075985
- **Primary 900**: #0c4a6e (darkest)

### Secondary Color Palette
- **Secondary 50**: #f5f3ff
- **Secondary 100**: #ede9fe
- **Secondary 200**: #ddd6fe
- **Secondary 300**: #c4b5fd
- **Secondary 400**: #a78bfa
- **Secondary 500**: #8b5cf6 (main secondary)
- **Secondary 600**: #7c3aed
- **Secondary 700**: #6d28d9
- **Secondary 800**: #5b21b6
- **Secondary 900**: #4c1d95

### Status Colors
- **Success**: #10b981 (emerald)
- **Warning**: #f59e0b (amber)
- **Error**: #ef4444 (red)
- **Info**: #3b82f6 (blue)
- **Neutral**: #6b7280 (gray)

### Background & Surface Colors
- **Background Light**: #f9fafb (gray-50)
- **Background Dark**: #0f172a (slate-900)
- **Surface Light**: #ffffff (white)
- **Surface Dark**: #1e293b (slate-800)
- **Card Light**: #ffffff (with glass effect)
- **Card Dark**: #334155 (slate-700, with glass effect)

### Glassmorphism Colors
- **Glass Light**: rgba(255, 255, 255, 0.75) with backdrop-filter
- **Glass Dark**: rgba(30, 41, 59, 0.75) with backdrop-filter
- **Glass Border**: rgba(255, 255, 255, 0.18) for light theme
- **Glass Border**: rgba(255, 255, 255, 0.1) for dark theme

## Typography System

### Font Stack
- **Primary Font**: Inter, system-ui, sans-serif
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- **Monospace**: 'SF Mono', Monaco, Consolas, monospace

### Font Scale
- **Display 1**: 3.5rem (56px) / 4rem (64px) line height
- **Display 2**: 2.75rem (44px) / 3.25rem (52px) line height
- **Display 3**: 2.25rem (36px) / 2.75rem (44px) line height
- **Heading 1**: 2rem (32px) / 2.5rem (40px) line height
- **Heading 2**: 1.75rem (28px) / 2.25rem (36px) line height
- **Heading 3**: 1.5rem (24px) / 2rem (32px) line height
- **Heading 4**: 1.25rem (20px) / 1.75rem (28px) line height
- **Body Large**: 1.125rem (18px) / 1.75rem (28px) line height
- **Body Regular**: 1rem (16px) / 1.5rem (24px) line height
- **Body Small**: 0.875rem (14px) / 1.25rem (20px) line height
- **Caption**: 0.75rem (12px) / 1rem (16px) line height

### Font Weights
- **Thin**: 100
- **Extra Light**: 200
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semi Bold**: 600
- **Bold**: 700
- **Extra Bold**: 800
- **Black**: 900

### Text Styles
- **Heading Style**: Semi-bold (600), uppercase tracking for section titles
- **Body Style**: Regular (400), normal tracking for readability
- **Label Style**: Medium (500), slightly smaller than body text
- **Button Style**: Medium (500), all caps for primary actions
- **Link Style**: Regular (400), underlined on hover, primary color

## Spacing System

### Base Unit
- **Base Unit**: 4px (0.25rem)
- **Scale**: Powers of 2 (1, 2, 4, 8, 16, 24, 32, 48, 64, 80, 96)

### Spacing Scale
- **Space 1**: 4px (0.25rem) - micro spacing
- **Space 2**: 8px (0.5rem) - component padding
- **Space 3**: 12px (0.75rem) - small element spacing
- **Space 4**: 16px (1rem) - standard component spacing
- **Space 5**: 20px (1.25rem) - section padding
- **Space 6**: 24px (1.5rem) - medium element spacing
- **Space 7**: 32px (2rem) - large element spacing
- **Space 8**: 40px (2.5rem) - section spacing
- **Space 9**: 48px (3rem) - container padding
- **Space 10**: 64px (4rem) - large section spacing

### Responsive Spacing
- **Mobile**: Base scale (1-10)
- **Tablet**: Multiply by 1.25 for key elements
- **Desktop**: Multiply by 1.5 for key elements
- **Large Desktop**: Multiply by 2 for key elements

## Layout System

### Grid System
- **Columns**: 12-column flexible grid
- **Gutters**: 16px standard, 24px for larger screens
- **Breakpoints**:
  - **Mobile**: 320px - 767px
  - **Tablet**: 768px - 1023px
  - **Desktop**: 1024px - 1439px
  - **Large Desktop**: 1440px+

### Container Sizes
- **Mobile**: 100% with 16px horizontal padding
- **Tablet**: 90% with 24px horizontal padding
- **Desktop**: 80% with 32px horizontal padding
- **Large Desktop**: 70% with 48px horizontal padding
- **Maximum Width**: 1200px center-aligned

### Z-Index Scale
- **Base**: 1 - default elements
- **Dropdown**: 1000 - dropdown menus
- **Sticky**: 1100 - sticky headers
- **Fixed**: 1200 - fixed elements
- **Overlay**: 1300 - overlays
- **Modal**: 1400 - modal dialogs
- **Popover**: 1500 - popovers
- **Skip Link**: 1600 - accessibility skip links
- **Toast**: 1700 - notifications
- **Tooltip**: 1800 - tooltips

## Component Design Specifications

### Button Specifications
- **Primary Button**:
  - Background: Primary 500
  - Text: White
  - Hover: Primary 600
  - Active: Primary 700
  - Border: None
  - Radius: 0.5rem (8px)
  - Padding: 0.75rem 1.5rem (12px 24px)
  - Animation: Scale 1.02 on hover, 0.98 on active

- **Secondary Button**:
  - Background: Transparent
  - Text: Primary 500
  - Hover: Primary 50 with background
  - Active: Primary 100 with background
  - Border: 1px solid Primary 300
  - Animation: Scale 1.02 on hover

- **Ghost Button**:
  - Background: Transparent
  - Text: Gray 700 (dark theme: Gray 300)
  - Hover: Gray 100 (dark theme: Gray 800)
  - Animation: Subtle background fade

### Form Element Specifications
- **Input Field**:
  - Background: Surface color
  - Border: 1px solid Gray 300 (dark: Gray 600)
  - Border Radius: 0.375rem (6px)
  - Padding: 0.75rem (12px)
  - Focus: Primary 500 border, shadow Primary 500/20%
  - Height: 3rem (48px)

- **Label**:
  - Font Size: 0.875rem (14px)
  - Font Weight: 500 (Medium)
  - Color: Gray 700 (dark: Gray 300)
  - Required: Red asterisk indicator

- **Checkbox/Radio**:
  - Size: 1.25rem (20px)
  - Border: 2px solid Gray 400
  - Checked: Primary 500 background with checkmark
  - Focus: Primary 500 ring with 2px width
  - Animation: Smooth check animation

### Card Specifications
- **Standard Card**:
  - Background: Surface color
  - Border: 1px solid Gray 200 (dark: Gray 700)
  - Border Radius: 0.75rem (12px)
  - Shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)
  - Padding: 1.5rem (24px)
  - Animation: Fade-in with scale

- **Glass Card**:
  - Background: Glass color (with backdrop-filter)
  - Border: 1px solid Glass border color
  - Border Radius: 1rem (16px)
  - Shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37)
  - Padding: 1.5rem (24px)
  - Animation: Smooth entrance with scale

## Visual Effects System

### Glassmorphism Effects
- **Light Theme Glass**:
  - Background: rgba(255, 255, 255, 0.75)
  - Backdrop Filter: blur(10px)
  - Border: 1px solid rgba(255, 255, 255, 0.18)
  - Box Shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37)

- **Dark Theme Glass**:
  - Background: rgba(30, 41, 59, 0.75)
  - Backdrop Filter: blur(10px)
  - Border: 1px solid rgba(255, 255, 255, 0.1)
  - Box Shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37)

### Gradient Effects
- **Primary Gradient**: linear(to-r, Primary 400, Primary 600)
- **Secondary Gradient**: linear(to-r, Secondary 400, Secondary 600)
- **Background Gradient**: linear(to-br, Primary 500, Secondary 500)
- **Text Gradient**: linear(to-r, Primary 500, Secondary 500)
- **Card Gradient**: Subtle gradient overlay for depth

### Shadow System
- **Shadow 1**: 0 1px 2px 0 rgba(0, 0, 0, 0.05) - subtle
- **Shadow 2**: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1) - standard
- **Shadow 3**: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1) - elevated
- **Shadow 4**: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -6px rgba(0, 0, 0, 0.1) - prominent
- **Shadow 5**: 0 25px 50px -12px rgba(0, 0, 0, 0.25) - floating

## Animation Design System

### Motion Principles
- **Natural Motion**: Easing functions that feel natural and intuitive
- **Performance**: All animations optimized for 60fps
- **Consistency**: Uniform timing and easing across all animations
- **Accessibility**: Respect reduced motion preferences
- **Feedback**: Immediate visual feedback for user interactions

### Animation Specifications
- **Duration**:
  - Quick (100ms): Micro-interactions, hover states
  - Short (200ms): Button clicks, simple transitions
  - Medium (300ms): Modal appearances, form transitions
  - Long (500ms): Page transitions, complex animations

- **Easing Functions**:
  - `ease-out`: For entrance animations (cubic-bezier(0.25, 0.46, 0.45, 0.94))
  - `ease-in`: For exit animations (cubic-bezier(0.47, 0, 0.745, 0.715))
  - `ease-in-out`: For state changes (cubic-bezier(0.42, 0, 0.58, 1))
  - `ease`: Default easing (cubic-bezier(0.25, 0.1, 0.25, 1))

- **Staggering**:
  - List items: 0.05s delay between items
  - Complex layouts: 0.03s delay between elements
  - Maximum total stagger: 0.5s for large lists

## Responsive Design System

### Breakpoint Specifications
- **Mobile First**: Base styles for mobile, enhanced for larger screens
- **Progressive Enhancement**: Add complexity as screen size increases
- **Touch Targets**: Minimum 44px for touch interactions
- **Reading Width**: Optimal 65-75 characters per line
- **Navigation**: Collapsible on mobile, expanded on desktop

### Adaptive Elements
- **Typography**: Scales appropriately across breakpoints
- **Spacing**: Adjusts to maintain visual balance
- **Components**: Adapts layout and interaction patterns
- **Images**: Responsive sizing with appropriate aspect ratios
- **Forms**: Optimized for touch interaction on mobile

## Accessibility System

### Color Accessibility
- **Contrast Ratios**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Color Blindness**: Test with color blindness simulators
- **Focus States**: Visible focus indicators for keyboard navigation
- **Text Alternatives**: Alt text for all meaningful images
- **Semantic Colors**: Meaningful color usage for status indicators

### Interaction Accessibility
- **Keyboard Navigation**: Full functionality via keyboard
- **Screen Reader**: Proper ARIA labels and semantic HTML
- **Reduced Motion**: Respects user motion preferences
- **Focus Management**: Proper focus management in modals and dialogs
- **Voice Control**: Compatible with voice control software

### Design System Maintenance
- **Documentation**: Keep design system documentation updated
- **Component Library**: Maintain consistent component implementations
- **Style Guide**: Regular updates to reflect design evolution
- **Testing**: Regular accessibility and usability testing
- **Feedback Loop**: Incorporate user feedback into design system