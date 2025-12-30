import { motion } from 'framer-motion';
import { FileText, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { optimizedFadeIn } from '@/lib/animations';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState = ({ title, description, icon, action, className }: EmptyStateProps) => {
  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-xl border-2 border-dashed border-border',
        className
      )}
      variants={optimizedFadeIn}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-4 p-3 bg-muted rounded-full">
        {icon || <FileText className="w-8 h-8 text-muted-foreground" />}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && (
        <motion.button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
};

export { EmptyState };