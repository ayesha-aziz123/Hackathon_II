---
id: 1
title: "frontend-ui-redesign-spec"
stage: "spec"
date: "2025-12-20"
surface: "agent"
model: "Claude Sonnet 4.5"
feature: "frontend-ui-redesign"
branch: "003-frontend-ui-redesign"
user: "user"
command: "/sp.specify Create comprehensive frontend UI specification for Todo App (Phase 2) using Next.js 16 App Router with shadcn/ui and Tailwind CSS..."
labels: ["frontend", "ui", "specification", "todo-app"]
links:
  spec: "specs/003-frontend-ui-redesign/spec.md"
  ticket: null
  adr: null
  pr: null
files:
  - "specs/003-frontend-ui-redesign/spec.md"
  - "specs/003-frontend-ui-redesign/checklists/requirements.md"
tests: []
prompt_text: "Create comprehensive frontend UI specification for Todo App (Phase 2) using Next.js 16 App Router with shadcn/ui and Tailwind CSS.\n\n## Project Context\n- Next.js 16 with App Router\n- shadcn/ui components installed\n- Tailwind CSS for styling\n- Better Auth for authentication\n- Dark theme required\n- Backend: FastAPI (Python) at `/api/*`\n- Current state: Functionality works (sign-in/sign-up), UI is basic and needs complete redesign\n\n## Requirements\n\n### 1. Public Marketing Site (/)\n**Layout**: Landing page with global Header and Footer\n**Content**:\n- Hero section with app description\n- Features showcase (3-4 key features)\n- Call-to-action buttons: \"Get Started\" and \"Sign In\"\n- NO auth forms on landing page\n- Professional, modern dark theme design\n\n**Header (Public)**:\n- Logo/Brand name on left\n- Navigation: Home, Features (if applicable)\n- Right side: \"Sign In\" and \"Get Started\" buttons\n- Responsive hamburger menu for mobile\n\n**Footer**:\n- Copyright info\n- Links (Privacy, Terms, Contact)\n- Social media icons (optional)\n\n### 2. Authentication Pages (/sign-in, /sign-up)\n**Layout**: Centered auth form with brand header\n**Components**:\n- Logo at top\n- Email/password form fields\n- Social login buttons (Google, GitHub)\n- \"Remember me\" checkbox\n- \"Forgot password\" link\n- \"Don't have an account?\" / \"Already have an account?\" links\n- Responsive design\n\n### 3. Protected Dashboard (/dashboard)\n**Layout**: App shell with sidebar navigation\n**Header**: User profile menu (name, avatar, logout)\n**Sidebar**: Navigation items (Dashboard, Tasks, Settings)\n**Main Content**: Task management interface\n\n### 4. Task Management Features\n**Task List View**:\n- Search/filter tasks by title, status, date\n- Sort by: created date, due date, priority\n- Pagination or infinite scroll\n- Bulk actions (select multiple, delete)\n\n**Task Creation**:\n- Form with title, description, due date, priority\n- Validation and error handling\n- Success feedback\n\n**Task Card Display**:\n- Title, description, status badge\n- Due date indicator\n- Priority level (visual indicator)\n- Quick action buttons (edit, delete, complete)\n\n### 5. Responsive Design\n- Mobile-first approach\n- Breakpoints: mobile (<768px), tablet (768px-1024px), desktop (>1024px)\n- Touch-friendly interactions\n- Adaptive layouts\n\n### 6. UI/UX Requirements\n- Dark theme implementation (using shadcn/ui dark mode)\n- Consistent spacing and typography\n- Loading states for all async operations\n- Error boundaries and user-friendly error messages\n- Smooth transitions and animations\n- Accessibility compliance (ARIA, keyboard navigation)\n\n### 7. Component Architecture\n**Layout Components**:\n```tsx\n// app/layout.tsx\n// app/(auth)/layout.tsx\n// app/(dashboard)/layout.tsx\n```\n\n**Shared Components**:\n- Header with navigation\n- Footer\n- LoadingSpinner\n- AlertDialog\n- DataTable with search/sort/pagination\n\n**Auth Components**:\n- SignInForm\n- SignUpForm\n- SocialAuthButtons\n\n**Task Components**:\n- TaskCard\n- TaskForm\n- TaskFilter\n- TaskList\n\n### 8. Route Structure\n```\n/\n  ├── / (landing page)\n  ├── /sign-in (authentication)\n  ├── /sign-up (authentication)\n  └── /dashboard (protected)\n      ├── /dashboard (default)\n      └── /dashboard/tasks (nested routes)\n```\n\n### 9. State Management\n- Better Auth client-side session management\n- React state for UI interactions\n- Optimistic updates for task operations\n- Error handling and loading states\n\n### 10. Styling Approach\n- Tailwind CSS utility classes\n- shadcn/ui component library\n- Custom dark theme configuration\n- Responsive utility classes\n- CSS variables for theme consistency\n\n### 11. Component Examples\n**Header Component**:\n```tsx\n// components/Header.tsx\nexport function Header() {\n  return (\n    <>\n      Sign In\n      Get Started\n    </>\n}\n```\n\n**TaskCard Component**:\n```tsx\n// Props: task, onEdit, onDelete, onToggle\n// Display: title, description, status badge\n// Actions: Edit icon, Delete icon, Status checkbox\n// Hover: Show actions\n```\n\n**CreateTaskDialog**:\n```tsx\n// shadcn Dialog\n// Form: Title (required), Description (optional), Status (dropdown)\n// Submit: Call API, optimistic update, close dialog\n```\n\n### 12. API Client Pattern\n```typescript\n// lib/api.ts\nasync function getTasks(userId: string) {\n  const res = await fetch(`/api/${userId}/tasks`)\n  return res.json()\n}\n\nasync function createTask(userId: string, data: TaskData) {\n  const res = await fetch(`/api/${userId}/tasks`, {\n    method: 'POST',\n    body: JSON.stringify(data)\n  })\n  return res.json()\n}\n```\n\n### 13. Success Criteria\n- ✅ Landing page is visually appealing (dark theme)\n- ✅ Auth flow works (sign-in/sign-up/logout)\n- ✅ Dashboard shows user's tasks only\n- ✅ CRUD operations work with optimistic UI\n- ✅ Route protection redirects unauthenticated users\n- ✅ Responsive design (mobile/tablet/desktop)\n- ✅ Loading/error states handled\n- ✅ User menu shows after login\n- ✅ All shadcn/ui components used properly\n- ✅ Dark theme consistently applied\n\nGenerate complete specification with detailed component designs, state management approach, and implementation guidelines."
response_text: "Created comprehensive frontend UI specification for Todo App Phase 2 with focus on user scenarios, functional requirements, and measurable success criteria. Specification includes public landing page, authentication flows, dashboard with task management, responsive design, and accessibility features. All requirements are testable and technology-agnostic success criteria are defined."
outcome: "Specification successfully created with all mandatory sections completed. Ready for planning phase (/sp.plan)."
evaluation: "Specification meets all quality criteria with clear user scenarios, testable requirements, and measurable outcomes."
---

## User Input

Create comprehensive frontend UI specification for Todo App (Phase 2) using Next.js 16 App Router with shadcn/ui and Tailwind CSS.

## Project Context
- Next.js 16 with App Router
- shadcn/ui components installed
- Tailwind CSS for styling
- Better Auth for authentication
- Dark theme required
- Backend: FastAPI (Python) at `/api/*`
- Current state: Functionality works (sign-in/sign-up), UI is basic and needs complete redesign

## Requirements

### 1. Public Marketing Site (/)
**Layout**: Landing page with global Header and Footer
**Content**:
- Hero section with app description
- Features showcase (3-4 key features)
- Call-to-action buttons: "Get Started" and "Sign In"
- NO auth forms on landing page
- Professional, modern dark theme design

**Header (Public)**:
- Logo/Brand name on left
- Navigation: Home, Features (if applicable)
- Right side: "Sign In" and "Get Started" buttons
- Responsive hamburger menu for mobile

**Footer**:
- Copyright info
- Links (Privacy, Terms, Contact)
- Social media icons (optional)

### 2. Authentication Pages (/sign-in, /sign-up)
**Layout**: Centered auth form with brand header
**Components**:
- Logo at top
- Email/password form fields
- Social login buttons (Google, GitHub)
- "Remember me" checkbox
- "Forgot password" link
- "Don't have an account?" / "Already have an account?" links
- Responsive design

### 3. Protected Dashboard (/dashboard)
**Layout**: App shell with sidebar navigation
**Header**: User profile menu (name, avatar, logout)
**Sidebar**: Navigation items (Dashboard, Tasks, Settings)
**Main Content**: Task management interface

### 4. Task Management Features
**Task List View**:
- Search/filter tasks by title, status, date
- Sort by: created date, due date, priority
- Pagination or infinite scroll
- Bulk actions (select multiple, delete)

**Task Creation**:
- Form with title, description, due date, priority
- Validation and error handling
- Success feedback

**Task Card Display**:
- Title, description, status badge
- Due date indicator
- Priority level (visual indicator)
- Quick action buttons (edit, delete, complete)

### 5. Responsive Design
- Mobile-first approach
- Breakpoints: mobile (<768px), tablet (768px-1024px), desktop (>1024px)
- Touch-friendly interactions
- Adaptive layouts

### 6. UI/UX Requirements
- Dark theme implementation (using shadcn/ui dark mode)
- Consistent spacing and typography
- Loading states for all async operations
- Error boundaries and user-friendly error messages
- Smooth transitions and animations
- Accessibility compliance (ARIA, keyboard navigation)

### 7. Component Architecture
**Layout Components**:
```tsx
// app/layout.tsx
// app/(auth)/layout.tsx
// app/(dashboard)/layout.tsx
```

**Shared Components**:
- Header with navigation
- Footer
- LoadingSpinner
- AlertDialog
- DataTable with search/sort/pagination

**Auth Components**:
- SignInForm
- SignUpForm
- SocialAuthButtons

**Task Components**:
- TaskCard
- TaskForm
- TaskFilter
- TaskList

### 8. Route Structure
```
/
  ├── / (landing page)
  ├── /sign-in (authentication)
  ├── /sign-up (authentication)
  └── /dashboard (protected)
      ├── /dashboard (default)
      └── /dashboard/tasks (nested routes)
```

### 9. State Management
- Better Auth client-side session management
- React state for UI interactions
- Optimistic updates for task operations
- Error handling and loading states

### 10. Styling Approach
- Tailwind CSS utility classes
- shadcn/ui component library
- Custom dark theme configuration
- Responsive utility classes
- CSS variables for theme consistency

### 11. Component Examples
**Header Component**:
```tsx
// components/Header.tsx
export function Header() {
  return (
    <>
      Sign In
      Get Started
    </>
}
```

**TaskCard Component**:
```tsx
// Props: task, onEdit, onDelete, onToggle
// Display: title, description, status badge
// Actions: Edit icon, Delete icon, Status checkbox
// Hover: Show actions
```

**CreateTaskDialog**:
```tsx
// shadcn Dialog
// Form: Title (required), Description (optional), Status (dropdown)
// Submit: Call API, optimistic update, close dialog
```

### 12. API Client Pattern
```typescript
// lib/api.ts
async function getTasks(userId: string) {
  const res = await fetch(`/api/${userId}/tasks`)
  return res.json()
}

async function createTask(userId: string, data: TaskData) {
  const res = await fetch(`/api/${userId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
  return res.json()
}
```

### 13. Success Criteria
- ✅ Landing page is visually appealing (dark theme)
- ✅ Auth flow works (sign-in/sign-up/logout)
- ✅ Dashboard shows user's tasks only
- ✅ CRUD operations work with optimistic UI
- ✅ Route protection redirects unauthenticated users
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Loading/error states handled
- ✅ User menu shows after login
- ✅ All shadcn/ui components used properly
- ✅ Dark theme consistently applied

Generate complete specification with detailed component designs, state management approach, and implementation guidelines.

## Assistant Response

Created comprehensive frontend UI specification for Todo App Phase 2 with focus on user scenarios, functional requirements, and measurable success criteria. Specification includes public landing page, authentication flows, dashboard with task management, responsive design, and accessibility features. All requirements are testable and technology-agnostic success criteria are defined.