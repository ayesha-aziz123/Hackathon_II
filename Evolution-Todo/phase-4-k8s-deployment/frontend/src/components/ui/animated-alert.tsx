import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { optimizedFadeIn } from '@/lib/animations';

interface AnimatedAlertProps {
  type: 'error' | 'success';
  message: string;
  className?: string;
}

const AnimatedAlert = ({ type, message, className }: AnimatedAlertProps) => {
  const isSuccessful = type === 'success';
  const Icon = isSuccessful ? CheckCircle : AlertCircle;
  const bgColor = isSuccessful ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30';
  const textColor = isSuccessful ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const iconColor = isSuccessful ? 'text-green-500' : 'text-red-500';

  return (
    <motion.div
      className={cn(
        'flex items-center p-4 rounded-lg border',
        bgColor,
        className
      )}
      variants={optimizedFadeIn}
      initial="hidden"
      animate="visible"
    >
      <Icon className={cn('w-5 h-5 mr-3', iconColor)} />
      <p className={cn('text-sm font-medium', textColor)}>{message}</p>
    </motion.div>
  );
};

export { AnimatedAlert };