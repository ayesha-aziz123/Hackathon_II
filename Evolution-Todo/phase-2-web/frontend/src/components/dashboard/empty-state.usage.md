# Empty State Component Usage

The `EmptyState` component provides an animated, visually appealing empty state for your dashboard.

## Basic Usage

```tsx
import { EmptyState } from '@/components/dashboard/empty-state';

// Default empty state for tasks
<EmptyState type="no-tasks" />

// Empty state for search results
<EmptyState type="no-search-results" />

// With custom action
<EmptyState
  type="no-projects"
  onAction={() => console.log('Create project clicked')}
/>
```

## Advanced Usage

```tsx
import { EmptyState } from '@/components/dashboard/empty-state';

// Custom content
<EmptyState
  type="custom"
  title="No items found"
  message="Try adjusting your filters to find what you're looking for"
  actionText="Reset Filters"
  onAction={() => resetFilters()}
  showAction={true}
/>

// With custom illustration
<EmptyState
  type="custom"
  illustration={
    <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </div>
  }
/>
```

## Props

- `type`: The type of empty state ('no-tasks', 'no-search-results', 'no-projects', 'no-notifications', 'custom')
- `title`: Custom title text (optional)
- `message`: Custom message text (optional)
- `actionText`: Text for the action button (optional)
- `onAction`: Function to call when action button is clicked (optional)
- `showAction`: Whether to show the action button (default: true)
- `className`: Additional CSS classes (optional)
- `illustration`: Custom illustration component (optional)
- `ariaLabel`: Accessibility label for the illustration (optional)