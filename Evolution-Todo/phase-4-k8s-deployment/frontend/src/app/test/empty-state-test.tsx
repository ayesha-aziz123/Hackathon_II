import { EmptyState } from '@/components/dashboard/empty-state';

const TestEmptyState = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <EmptyState type="no-tasks" />
        <EmptyState type="no-search-results" />
        <EmptyState type="no-projects" />
        <EmptyState type="no-notifications" />
      </div>
    </div>
  );
};

export default TestEmptyState;