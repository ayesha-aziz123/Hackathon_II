# Task Management UI Skill

Build complete task management interfaces with proper forms, modals, filters, and list views.

## Core Components

### Task List Page
```typescript
// app/tasks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter } from 'lucide-react';
import TaskCard from '@/components/tasks/task-card';
import TaskFormModal from '@/components/tasks/task-form-modal';
import TaskFilters from '@/components/tasks/task-filters';
import { getTasks } from '@/lib/api/tasks';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    tag: ''
  });

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadTasks = async () => {
    const data = await getTasks(filters);
    setTasks(data);
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.tag && !task.tags?.includes(filters.tag)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <TaskFilters filters={filters} onChange={setFilters} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Task</span>
          </motion.button>
        </div>
      </div>

      {/* Task List */}
      <AnimatePresence mode="popLayout">
        {filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Filter className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No tasks found</h3>
              <p className="text-muted-foreground">
                Try changing your filters or create a new task
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onUpdate={loadTasks}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Create Task Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadTasks}
      />
    </div>
  );
}
```

### Task Card Component
```typescript
// components/tasks/task-card.tsx
'use client';

import { motion } from 'framer-motion';
import { Calendar, Tag, MoreVertical, Check } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: any;
  index: number;
  onUpdate: () => void;
}

const priorityColors = {
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const statusColors = {
  pending: 'bg-gray-500/10 text-gray-500',
  active: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
};

export default function TaskCard({ task, index, onUpdate }: TaskCardProps) {
  const handleToggleComplete = async () => {
    // Toggle task completion
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: task.status === 'completed' ? 'active' : 'completed'
      })
    });
    onUpdate();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border rounded-xl p-5 hover:shadow-lg transition-shadow group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={handleToggleComplete}
            className={`
              mt-1 w-5 h-5 rounded border-2 flex items-center justify-center
              transition-all hover:scale-110
              ${task.status === 'completed' 
                ? 'bg-green-500 border-green-500' 
                : 'border-muted-foreground hover:border-primary'
              }
            `}
          >
            {task.status === 'completed' && (
              <Check className="w-3 h-3 text-white" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3 className={`
              font-semibold text-lg leading-tight
              ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}
            `}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>

        <button className="p-1 hover:bg-accent rounded transition-colors opacity-0 group-hover:opacity-100">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {task.tags.map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-accent rounded text-xs"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {task.dueDate && format(new Date(task.dueDate), 'MMM dd')}
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
            {task.status}
          </span>
          <span className={`px-2 py-1 rounded border text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
            {task.priority}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
```

### Task Form Modal (Proper Width/Height)
```typescript
// components/tasks/task-form-modal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: any;
}

export default function TaskFormModal({ isOpen, onClose, onSuccess, task }: TaskFormModalProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    dueDate: task?.dueDate || '',
    tags: task?.tags?.join(', ') || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      const url = task ? `/api/tasks/${task.id}` : '/api/tasks';
      const method = task ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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

          {/* Modal - PROPER WIDTH/HEIGHT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-card rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">
                {task ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form - Scrollable */}
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(85vh-140px)]">
              <div className="p-6 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="Enter task title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Add task description"
                  />
                </div>

                {/* Priority & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="work, urgent, design"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```

### Task Filters Component
```typescript
// components/tasks/task-filters.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

interface TaskFiltersProps {
  filters: {
    status: string;
    priority: string;
    tag: string;
  };
  onChange: (filters: any) => void;
}

export default function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = filters.status !== 'all' || filters.priority !== 'all' || filters.tag !== '';

  const clearFilters = () => {
    onChange({
      status: 'all',
      priority: 'all',
      tag: ''
    });
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-colors
          ${hasActiveFilters ? 'bg-primary/10 border-primary text-primary' : 'hover:bg-accent'}
        `}
      >
        <Filter className="w-5 h-5" />
        <span className="hidden sm:inline">Filters</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-primary rounded-full" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-72 bg-card border rounded-xl shadow-xl z-50 p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => onChange({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 bg-background border rounded-lg"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => onChange({ ...filters, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-background border rounded-lg"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Tag Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Tag</label>
                <input
                  type="text"
                  value={filters.tag}
                  onChange={(e) => onChange({ ...filters, tag: e.target.value })}
                  placeholder="Search by tag"
                  className="w-full px-3 py-2 bg-background border rounded-lg"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## Modal Guidelines

### Proper Dimensions
```typescript
// ✅ GOOD: Well-proportioned modal
className="w-full max-w-2xl max-h-[85vh]"

// ❌ BAD: Too narrow and tall
className="w-96 h-screen"
```

### Scrollable Content
```typescript
// Header: Fixed
<div className="p-6 border-b">

// Body: Scrollable
<div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6">

// Footer: Fixed
<div className="p-6 border-t">
```

## Animations

### List Items Stagger
```typescript
{tasks.map((task, index) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  />
))}
```

### Modal Enter/Exit
```typescript
initial={{ opacity: 0, scale: 0.95, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 20 }}
```

### Empty State
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  className="text-center py-16"
>
```

## Usage by Agent

When building task management UI:
1. Create task list page with filters
2. Build task card component with animations
3. Implement properly-sized modal form
4. Add filter dropdown component
5. Ensure responsive design
6. Add smooth animations
7. Handle loading and empty states
8. Test on all screen sizes