import Link from 'next/link';

const DemoPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Component Demos</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Interactive demonstrations of various UI components
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/demo/empty-state"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Empty State</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Animated empty state component with glassmorphism design and various types
            </p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              Dashboard
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;