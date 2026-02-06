'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Define the types of empty states
type EmptyStateType = 'no-tasks' | 'no-search-results' | 'no-projects' | 'no-notifications' | 'custom';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
  className?: string;
  illustration?: React.ReactNode;
  ariaLabel?: string;
}

const EmptyState = ({
  type = 'no-tasks',
  title,
  message,
  actionText,
  onAction,
  showAction = true,
  className = '',
  illustration,
  ariaLabel = 'Empty state illustration'
}: EmptyStateProps) => {
  // Define content based on type
  const getContent = () => {
    switch (type) {
      case 'no-tasks':
        return {
          title: title || 'No tasks yet',
          message: message || 'Get started by creating your first task. You\'ll be amazed at how much you can accomplish!',
          actionText: actionText || 'Create Task',
          illustration: illustration || (
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )
        };
      case 'no-search-results':
        return {
          title: title || 'No results found',
          message: message || 'Try adjusting your search terms or filters to find what you\'re looking for.',
          actionText: actionText || 'Clear Search',
          illustration: illustration || (
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )
        };
      case 'no-projects':
        return {
          title: title || 'No projects yet',
          message: message || 'Create your first project to organize your tasks and boost your productivity.',
          actionText: actionText || 'Create Project',
          illustration: illustration || (
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )
        };
      case 'no-notifications':
        return {
          title: title || 'No notifications',
          message: message || 'You\'re all caught up! New notifications will appear here when they arrive.',
          actionText: actionText || 'View Settings',
          illustration: illustration || (
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )
        };
      case 'custom':
      default:
        return {
          title: title || 'Nothing here yet',
          message: message || 'There\'s nothing to display at the moment. Check back later!',
          actionText: actionText || 'Get Started',
          illustration: illustration || (
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-400 to-pink-500 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )
        };
    }
  };

  const content = getContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center w-full max-w-lg mx-auto p-6',
        'bg-white/10 dark:bg-gray-900/10 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-800/50',
        'shadow-lg shadow-black/5 dark:shadow-black/10',
        className
      )}
      aria-label={content.title}
    >
      {/* Animated illustration with floating effect */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [-10, 10, -10] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="mb-6"
        aria-hidden="true"
      >
        {content.illustration}
      </motion.div>

      {/* Title with animation */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center"
      >
        {content.title}
      </motion.h2>

      {/* Message with animation */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-gray-600 dark:text-gray-300 text-center mb-6 max-w-md"
      >
        {content.message}
      </motion.p>

      {/* Action button with hover animation */}
      {showAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onAction}
            className="relative overflow-hidden group"
          >
            <span className="relative z-10">{content.actionText}</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export { EmptyState, type EmptyStateProps };