# Page Transitions

This project implements smooth page transitions for dashboard routes using Framer Motion. The transitions provide a polished user experience with fade, slide, scale, and other animation effects between pages.

## Components

### PageTransition Component
- Located at: `src/components/layout/page-transition.tsx`
- Provides animated transitions between pages
- Uses Framer Motion's `AnimatePresence` and `motion` components
- Supports multiple transition types

### Transition Context
- Located at: `src/contexts/transition-context.tsx`
- Provides a way to manage transition types across the app
- Allows individual pages to specify their own transition types

## Available Transition Types

- `fade`: Simple fade in/out effect (default)
- `slide`: Slides content from left to right
- `slideFromRight`: Slides content from right to left
- `scale`: Scales content up/down with fade
- `slideUp`: Slides content up/down with fade

## Usage

### Global Default Transition
The dashboard layout sets a default transition type in `src/app/dashboard/layout.tsx`:

```tsx
<TransitionProvider transitionType="fade">
  <PageTransition>
    {children}
  </PageTransition>
</TransitionProvider>
```

### Page-Specific Transitions
Individual pages can override the default transition by wrapping their content with `TransitionProvider`:

```tsx
import { TransitionProvider } from '@/contexts/transition-context';

export default function MyPage() {
  return (
    <TransitionProvider transitionType="scale">
      <div>
        {/* Page content */}
      </div>
    </TransitionProvider>
  );
}
```

### Direct Transition Override
You can also pass a transition type directly to the PageTransition component:

```tsx
<PageTransition type="slideFromRight">
  {children}
</PageTransition>
```

## Accessibility Features

- Screen reader announcements when page content updates
- Proper ARIA attributes for accessibility
- Keyboard navigation support
- Focus management

## Performance Considerations

- Uses efficient Framer Motion animations
- Proper cleanup of effects
- Optimized for smooth 60fps animations
- Only animates when necessary