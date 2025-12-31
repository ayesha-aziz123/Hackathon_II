import { ReactNode } from 'react';

const TestLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Component Tests</h1>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
};

export default TestLayout;