'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Task } from '@/lib/types';
import { Plus, Filter, Eye } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    pending: 0,
    total: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const tasks: Task[] = await api.getTasks();

        const active = tasks.filter(t => !t.completed).length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = tasks.filter(t => !t.completed && (!t.due_date || new Date(t.due_date) > new Date())).length;
        const total = tasks.length;

        setStats({ active, completed, pending, total });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect will happen via useEffect
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 25,
        stiffness: 100,
        duration: 0.4
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 p-4 md:p-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back {user.name}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your tasks today.</p>
        </div>
      </motion.div>

      {/* Stats Overview Section */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
          <h3 className="text-sm font-medium text-muted-foreground">Total Tasks</h3>
          <p className="text-2xl font-bold mt-1">{loadingStats ? '...' : stats.total}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
          <h3 className="text-sm font-medium text-muted-foreground">Active</h3>
          <p className="text-2xl font-bold mt-1">{loadingStats ? '...' : stats.active}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
          <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
          <p className="text-2xl font-bold mt-1">{loadingStats ? '...' : stats.completed}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
          <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
          <p className="text-2xl font-bold mt-1">{loadingStats ? '...' : stats.pending}</p>
        </div>
      </motion.div>

      {/* Quick Actions Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border"
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Manage your tasks efficiently</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            className="h-12 flex items-center gap-2"
            onClick={() => router.push('/dashboard/tasks')}
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
          <Button
            variant="outline"
            className="h-12 flex items-center gap-2"
            onClick={() => router.push('/dashboard/tasks')}
          >
            <Eye className="h-4 w-4" />
            View All
          </Button>
          <Button variant="outline" className="h-12 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}