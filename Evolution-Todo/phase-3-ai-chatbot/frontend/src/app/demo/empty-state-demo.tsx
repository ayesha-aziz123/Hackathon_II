'use client';

import { EmptyState } from '@/components/dashboard/empty-state';
import { useState } from 'react';

const EmptyStateDemo = () => {
  const [emptyStateType, setEmptyStateType] = useState<'no-tasks' | 'no-search-results' | 'no-projects' | 'no-notifications' | 'custom'>('no-tasks');

  const handleAction = () => {
    alert(`Action triggered for ${emptyStateType} state`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Empty State Component Demo
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setEmptyStateType('no-tasks')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              emptyStateType === 'no-tasks'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            No Tasks
          </button>
          <button
            onClick={() => setEmptyStateType('no-search-results')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              emptyStateType === 'no-search-results'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            No Search Results
          </button>
          <button
            onClick={() => setEmptyStateType('no-projects')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              emptyStateType === 'no-projects'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            No Projects
          </button>
          <button
            onClick={() => setEmptyStateType('no-notifications')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              emptyStateType === 'no-notifications'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            No Notifications
          </button>
          <button
            onClick={() => setEmptyStateType('custom')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              emptyStateType === 'custom'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Custom
          </button>
        </div>

        <div className="flex justify-center">
          <EmptyState
            type={emptyStateType}
            onAction={handleAction}
          />
        </div>
      </div>
    </div>
  );
};

export default EmptyStateDemo;