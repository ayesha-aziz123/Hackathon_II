import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, optimizedFadeIn } from '@/lib/animations';

interface AnimatedTaskListProps {
  tasks: any[]; // Replace with proper task type
  children: React.ReactNode;
  className?: string;
}

const AnimatedTaskList = ({ tasks, children, className }: AnimatedTaskListProps) => {
  const [filteredTasks, setFilteredTasks] = useState(tasks);

  // Simulate filtering behavior (in a real app, this would come from props)
  useEffect(() => {
    setFilteredTasks(tasks);
  }, [tasks]);

  return (
    <motion.div
      className={cn('space-y-4', className)}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id || index}
            variants={staggerItem}
            initial="hidden"
            animate="visible"
            exit="hidden"
            layout // Enable layout animations for smooth transitions when items are added/removed
            transition={{
              layout: { duration: 0.3, ease: [0.33, 1, 0.68, 1] } // Use same easing as our presets
            }}
          >
            {children}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export { AnimatedTaskList };