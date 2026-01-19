# Empty State Component

The `EmptyState` component provides a visually appealing and animated empty state for different scenarios in the dashboard. It features smooth animations, glassmorphism design, and responsive layout.

## Features

- Animated illustration with floating effect using Framer Motion
- Call-to-action button with hover animations
- Friendly messages for different empty state types
- Glassmorphism design with backdrop blur
- Responsive design that works on all screen sizes
- Support for different empty state types (no tasks, no search results, etc.)
- Full accessibility support

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'no-tasks' \| 'no-search-results' \| 'no-projects' \| 'no-notifications' \| 'custom'` | `'no-tasks'` | Type of empty state to display |
| `title` | `string` | Based on type | Custom title for the empty state |
| `message` | `string` | Based on type | Custom message for the empty state |
| `actionText` | `string` | Based on type | Text for the action button |
| `onAction` | `() => void` | `undefined` | Callback function for the action button |
| `showAction` | `boolean` | `true` | Whether to show the action button |
| `className` | `string` | `''` | Additional CSS classes |
| `illustration` | `React.ReactNode` | Based on type | Custom illustration component |
| `ariaLabel` | `string` | `'Empty state illustration'` | Accessibility label for the illustration |

## Usage Examples

### Basic Usage
```tsx
import { EmptyState } from '@/components/dashboard/empty-state';

// Default no-tasks state
<EmptyState />

// No search results
<EmptyState type="no-search-results" />
```

### Custom Content
```tsx
<EmptyState
  type="custom"
  title="Custom Title"
  message="Custom message"
  actionText="Custom Action"
  onAction={() => console.log('Action clicked')}
/>
```

### Without Action Button
```tsx
<EmptyState
  type="no-tasks"
  showAction={false}
/>
```

### With Custom Illustration
```tsx
<EmptyState
  type="custom"
  illustration={
    <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {/* Your custom SVG */}
      </svg>
    </div>
  }
/>
```

## Animation Details

The component uses Framer Motion for smooth animations:
- Initial fade-in with slight slide-up effect
- Floating animation for the illustration
- Staggered animations for title, message, and button
- Hover animations on the action button

## Accessibility

The component includes proper accessibility attributes:
- `aria-label` for the illustration
- Semantic HTML elements
- Proper focus states
- Screen reader support