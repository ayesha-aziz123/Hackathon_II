# Framer Motion Animations Skill

Implement smooth, performant animations using Framer Motion for modern web interfaces.

## Installation & Setup

```bash
npm install framer-motion
```

```typescript
// In your component
'use client'; // Required for Next.js

import { motion, AnimatePresence } from 'framer-motion';
```

## Core Animation Patterns

### Basic Fade In
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Slide In from Bottom
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  Content
</motion.div>
```

### Scale In
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Stagger Children
```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div
  variants={container}
  initial="hidden"
  animate="show"
>
  {items.map(item => (
    <motion.div key={item.id} variants={item}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

## Advanced Patterns

### Hover & Tap Interactions
```typescript
<motion.button
  whileHover={{ scale: 1.05, y: -2 }}
  whileTap={{ scale: 0.95 }}
  className="px-6 py-3 bg-primary rounded-lg"
>
  Click Me
</motion.button>
```

### Layout Animations
```typescript
// Automatically animates layout changes
<motion.div layout>
  {/* Content that changes size/position */}
</motion.div>

// With spring physics
<motion.div
  layout
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>
```

### Page Transitions
```typescript
// app/layout.tsx or page wrapper
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### Scroll-Based Animations
```typescript
import { useScroll, useTransform } from 'framer-motion';

function Component() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  return (
    <motion.div style={{ opacity }}>
      Fades out as you scroll
    </motion.div>
  );
}
```

## Modal/Dialog Animations

### Full Modal with Backdrop
```typescript
<AnimatePresence>
  {isOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative bg-card rounded-2xl max-w-2xl w-full"
      >
        Modal Content
      </motion.div>
    </div>
  )}
</AnimatePresence>
```

### Slide Up Modal (Mobile-Style)
```typescript
<motion.div
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "100%" }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
  className="fixed inset-x-0 bottom-0 bg-card rounded-t-2xl"
>
  Modal Content
</motion.div>
```

## List Animations

### Item Enter/Exit
```typescript
<AnimatePresence mode="popLayout">
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -100 }}
      transition={{ delay: index * 0.05 }}
    >
      {item.content}
    </motion.div>
  ))}
</AnimatePresence>
```

### Reorder List
```typescript
import { Reorder } from 'framer-motion';

<Reorder.Group values={items} onReorder={setItems}>
  {items.map(item => (
    <Reorder.Item key={item.id} value={item}>
      {item.content}
    </Reorder.Item>
  ))}
</Reorder.Group>
```

## Sidebar Animations

### Slide In/Out
```typescript
<motion.aside
  initial={false}
  animate={{
    x: isOpen ? 0 : -320,
  }}
  transition={{
    type: "spring",
    stiffness: 300,
    damping: 30
  }}
  className="fixed inset-y-0 left-0 w-64"
>
  Sidebar Content
</motion.aside>
```

### With Width Animation (Not Recommended)
```typescript
// ⚠️ Avoid animating width - use transform instead
// Width animations can cause reflows

// ✅ Better: Use scaleX or translateX
<motion.div
  animate={{ scaleX: isOpen ? 1 : 0 }}
  style={{ transformOrigin: "left" }}
/>
```

## Card Animations

### Hover Card
```typescript
<motion.div
  whileHover={{ 
    scale: 1.02, 
    y: -4,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
  }}
  transition={{ duration: 0.2 }}
  className="bg-card p-6 rounded-xl"
>
  Card Content
</motion.div>
```

### Loading Card Skeleton
```typescript
<motion.div
  animate={{
    opacity: [0.5, 1, 0.5],
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut"
  }}
  className="bg-muted rounded-lg h-20"
/>
```

## Button Animations

### Primary Button
```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="px-6 py-3 bg-primary text-white rounded-lg"
>
  Button
</motion.button>
```

### Icon Button
```typescript
<motion.button
  whileHover={{ rotate: 90 }}
  transition={{ duration: 0.2 }}
>
  <X className="w-5 h-5" />
</motion.button>
```

## Form Animations

### Error Message
```typescript
<AnimatePresence>
  {error && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="text-red-500 text-sm mt-1"
    >
      {error}
    </motion.div>
  )}
</AnimatePresence>
```

### Success Checkmark
```typescript
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ 
    type: "spring", 
    stiffness: 400, 
    damping: 10 
  }}
>
  <Check className="w-16 h-16 text-green-500" />
</motion.div>
```

## Transition Types

### Spring (Default - Natural)
```typescript
transition={{ type: "spring", stiffness: 300, damping: 30 }}
```

### Tween (Smooth Easing)
```typescript
transition={{ 
  type: "tween", 
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] // Custom cubic-bezier
}}
```

### Inertia (Momentum)
```typescript
transition={{ type: "inertia", velocity: 50 }}
```

## Performance Tips

### GPU-Accelerated Properties (Fast)
- `opacity`
- `transform` (scale, rotate, translateX, translateY)

### Avoid Animating (Slow)
- `width`, `height`
- `top`, `left`, `bottom`, `right`
- `padding`, `margin`

### Use Layout Prop for Size Changes
```typescript
// Instead of animating width
<motion.div layout>
  {/* Content that changes size */}
</motion.div>
```

### Reduce Motion for Accessibility
```typescript
import { useReducedMotion } from 'framer-motion';

function Component() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={{ 
        x: shouldReduceMotion ? 0 : 100 
      }}
    />
  );
}
```

## Common Animation Variants

### Fade Up
```typescript
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

<motion.div variants={fadeUp} />
```

### Fade In
```typescript
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};
```

### Scale In
```typescript
const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};
```

### Slide In
```typescript
const slideIn = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 }
};
```

## Testing Animations

### Check Performance
```typescript
// Monitor frame rate
<motion.div
  onAnimationComplete={() => console.log('Animation complete')}
  onUpdate={(latest) => console.log('Values:', latest)}
/>
```

### Debug Layout Animations
```typescript
<motion.div
  layout
  layoutId="unique-id" // Helps debug
  onLayoutAnimationStart={() => console.log('Layout animation started')}
  onLayoutAnimationComplete={() => console.log('Layout animation complete')}
/>
```

## Usage by Agent

When implementing animations:
1. Choose appropriate animation type (fade, slide, scale)
2. Use spring physics for natural feel
3. Implement stagger for lists
4. Add hover/tap interactions for buttons
5. Use AnimatePresence for mount/unmount
6. Keep animations subtle (200-400ms)
7. Test on mobile devices
8. Respect reduced motion preferences
9. Avoid animating expensive properties
10. Use layout prop for size changes

## Common Mistakes

❌ Animating width/height directly
❌ Too many simultaneous animations
❌ Long animation durations (>500ms)
❌ Forgetting AnimatePresence for exit animations
❌ Not using 'use client' in Next.js

✅ Animate transform properties
✅ Stagger animations for better UX
✅ Keep animations quick (200-400ms)
✅ Always wrap exit animations in AnimatePresence
✅ Mark components as 'use client'