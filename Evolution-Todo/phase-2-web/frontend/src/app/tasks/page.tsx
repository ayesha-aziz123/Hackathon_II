'use client';

import { useAuth } from '@/components/AuthProvider';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserButton from '@/components/Navbar/UserButton';
import TaskList from '@/components/TaskList/TaskList';

export default function TasksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect will happen via useEffect
  }

  return (
    <div className="mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user.name || user.email}!</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <TaskList userId={user.id} />
        <UserButton className="mt-6" />
      </div>
    </div>
  );
}