import Link from 'next/link';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Component Tests</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Test pages for various components
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/test/empty-state"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Empty State Test</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Test page for the empty state component
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestPage;