# Quickstart Guide: Frontend UI Redesign for Todo App

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- Better Auth configured in Next.js app
- Backend API running at `/api/*` endpoints

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Navigate to frontend directory
cd phase-2-web/frontend

# Install dependencies
npm install
# or
yarn install
```

### 2. Environment Configuration

Create a `.env.local` file in the frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-here
```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:3000`

## Key Features Implementation

### 1. Dark Theme Setup

```bash
# Install theme provider
npm install next-themes
```

Add to `app/providers.tsx`:
```tsx
'use client'

import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}
```

### 2. shadcn/ui Components

Install and configure shadcn/ui components:

```bash
# Install shadcn/ui CLI
npx shadcn-ui@latest add button card input label textarea select
```

### 3. Better Auth Integration

Setup authentication in `lib/auth.ts`:
```tsx
import { betterAuth } from 'better-auth/react'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  // ... other config
})
```

### 4. API Client Setup

Create `lib/api.ts` for API calls with JWT:
```tsx
// This client automatically attaches JWT tokens to requests
```

## Component Structure

### Landing Page Components
- `components/landing/hero.tsx` - Hero section with CTA
- `components/landing/features.tsx` - Features showcase
- `components/landing/cta.tsx` - Call-to-action section

### Authentication Components
- `components/auth/signin-form.tsx` - Sign-in form
- `components/auth/signup-form.tsx` - Sign-up form
- `components/auth/user-menu.tsx` - User profile menu

### Dashboard Components
- `components/dashboard/header.tsx` - Dashboard header
- `components/dashboard/sidebar.tsx` - Navigation sidebar
- `components/dashboard/task-list.tsx` - Task listing component

### Task Management Components
- `components/tasks/task-card.tsx` - Individual task display
- `components/tasks/task-form.tsx` - Task creation/editing form
- `components/tasks/task-filter.tsx` - Task filtering controls
- `components/tasks/task-status-badge.tsx` - Status indicator

## Development Workflow

### 1. Create New Components
```bash
# Use shadcn/ui to add new components
npx shadcn-ui@latest add [component-name]
```

### 2. Add New Pages
- Add pages to `app/` directory using App Router
- Use Server Components by default
- Add `"use client"` directive only when interactivity is needed

### 3. Theme Integration
- Use `dark:` prefix for dark theme variants in Tailwind
- Test components in both light and dark modes
- Ensure WCAG 2.1 AA contrast ratios

## Testing Commands

```bash
# Run unit tests
npm run test

# Run linting
npm run lint

# Run type checking
npm run type-check

# Build for production
npm run build
```

## Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## Common Tasks

### 1. Adding a New Page
1. Create directory in `app/` (e.g., `app/dashboard`)
2. Add `page.tsx` file in the directory
3. Import necessary components from `components/`

### 2. Adding a New Component
1. Create component in `components/` directory
2. Follow shadcn/ui patterns for consistency
3. Add proper TypeScript types and accessibility attributes

### 3. Theming Components
1. Use Tailwind's dark mode classes: `dark:bg-gray-800`
2. Test in both themes during development
3. Ensure sufficient contrast ratios