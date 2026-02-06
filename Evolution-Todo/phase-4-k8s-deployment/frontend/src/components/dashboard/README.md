# Dashboard Components

This directory contains components specifically designed for the dashboard interface.

## Components

### Empty State (`empty-state.tsx`)

An animated empty state component that provides a visually appealing experience when there's no data to display. Features include:

- Animated illustrations with floating effects
- Glassmorphism design with backdrop blur
- Responsive layout that works on all screen sizes
- Support for multiple empty state types (tasks, search results, projects, notifications)
- Framer Motion animations for smooth transitions
- Accessible with proper ARIA attributes
- Customizable content and illustrations

### Dashboard Header (`header.tsx`)

The header component for the dashboard layout.

### Search Bar (`search-bar.tsx`)

Search functionality for the dashboard with filtering capabilities.

### Sidebar (`sidebar.tsx`)

Navigation sidebar for the dashboard with collapsible sections.

### Stats Card (`StatsCard.tsx`)

Card component for displaying key metrics and statistics.

### User Menu (`user-menu.tsx`)

User profile dropdown menu with account options.

### Dashboard Skeleton (`DashboardSkeleton.tsx`)

Loading skeleton for dashboard content while data is being fetched.

## Usage

All components are designed to work together as part of the dashboard layout. Import components as needed:

```tsx
import { EmptyState } from '@/components/dashboard/empty-state';
import { DashboardHeader } from '@/components/dashboard/header';
import { SearchBar } from '@/components/dashboard/search-bar';
```