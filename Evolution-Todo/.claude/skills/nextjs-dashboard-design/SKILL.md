# Next.js Dashboard Design Skill

Design and build clean, minimal, responsive dashboards with dynamic data from database.

## What This Skill Does

- Creates minimal dashboard layouts with essential metrics
- Integrates dynamic data from database (task counts, stats)
- Builds status cards (active, completed, pending)
- Adds quick action buttons
- Ensures full responsiveness
- Implements smooth animations

## Implementation Pattern

### Dashboard Structure
```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { getTasks } from '@/lib/api/tasks';
import StatusCard from '@/components/dashboard/status-card';
import QuickActions from '@/components/dashboard/quick-actions';

export default async function DashboardPage() {
  const tasks = await getTasks();
  
  const stats = {
    active: tasks.filter(t => t.status === 'active').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    total: tasks.length
  };

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your tasks efficiently
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatusCard
            title="Active Tasks"
            count={stats.active}
            icon="activity"
            color="blue"
          />
          <StatusCard
            title="Completed"
            count={stats.completed}
            icon="check-circle"
            color="green"
          />
          <StatusCard
            title="Pending"
            count={stats.pending}
            icon="clock"
            color="yellow"
          />
          <StatusCard
            title="Total Tasks"
            count={stats.total}
            icon="list"
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </motion.div>
    </div>
  );
}
```

### Status Card Component
```typescript
// components/dashboard/status-card.tsx
'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface StatusCardProps {
  title: string;
  count: number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const colorClasses = {
  blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
  green: 'from-green-500/10 to-green-500/5 border-green-500/20',
  yellow: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20',
  purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20'
};

const iconColorClasses = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  yellow: 'text-yellow-500',
  purple: 'text-purple-500'
};

export default function StatusCard({ title, count, icon, color }: StatusCardProps) {
  const Icon = Icons[icon as keyof typeof Icons] as LucideIcon;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-6 ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{count}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-background/50 ${iconColorClasses[color]}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      
      <motion.div
        className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full opacity-10 bg-current`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}
```

### Quick Actions Component
```typescript
// components/dashboard/quick-actions.tsx
'use client';

import { motion } from 'framer-motion';
import { Plus, Filter, Eye } from 'lucide-react';
import Link from 'next/link';

const actions = [
  { icon: Plus, label: 'New Task', href: '/tasks?action=new', color: 'blue' },
  { icon: Eye, label: 'View All', href: '/tasks', color: 'purple' },
  { icon: Filter, label: 'Filter Tasks', href: '/tasks?filter=true', color: 'green' }
];

const colorClasses = {
  blue: 'hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-500',
  purple: 'hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-500',
  green: 'hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-500'
};

export default function QuickActions() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={action.href}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 p-4 rounded-lg border bg-card transition-colors ${colorClasses[action.color as keyof typeof colorClasses]}`}
              >
                <action.icon className="w-5 h-5" />
                <span className="font-medium">{action.label}</span>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

## Responsive Breakpoints

- Mobile: Default styles
- Tablet: `sm:` and `md:` prefixes
- Desktop: `lg:` and `xl:` prefixes
- Large Desktop: `2xl:` prefix

## Usage

When agent calls this skill, it will:
1. Check existing dashboard structure
2. Fetch task data from database
3. Calculate statistics dynamically
4. Build status cards with animations
5. Add quick action buttons
6. Ensure full responsiveness
7. Implement smooth transitions

## DO NOT Include

- Progress bars (unless explicitly requested)
- Recent tasks section (unless explicitly requested)
- Complex charts (unless explicitly requested)
- Over-complicated layouts

## Always Include

- Dynamic data from database
- Responsive design
- Smooth animations
- Clean, minimal UI
- Proper loading states
- Error handling