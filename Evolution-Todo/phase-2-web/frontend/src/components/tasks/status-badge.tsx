"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        pending: "bg-yellow-100/20 dark:bg-yellow-900/30 border border-yellow-200/30 dark:border-yellow-800/40 text-yellow-700 dark:text-yellow-300",
        "in-progress": "bg-blue-100/20 dark:bg-blue-900/30 border border-blue-200/30 dark:border-blue-800/40 text-blue-700 dark:text-blue-300",
        completed: "bg-green-100/20 dark:bg-green-900/30 border border-green-200/30 dark:border-green-800/40 text-green-700 dark:text-green-300",
      },
    },
    defaultVariants: {
      variant: "pending",
    },
  }
);

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrag">,
    VariantProps<typeof statusBadgeVariants> {
  status?: 'pending' | 'in-progress' | 'completed';
  showDot?: boolean;
  dotAnimation?: boolean;
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, variant, status, showDot = true, dotAnimation = true, children, ...props }, ref) => {
    const statusVariant = variant || status || "pending";
    const dotColor = {
      pending: "bg-yellow-500",
      "in-progress": "bg-blue-500",
      completed: "bg-green-500",
    }[statusVariant];

    return (
      <motion.div
        ref={ref}
        className={cn(statusBadgeVariants({ variant: statusVariant }), className)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {showDot && (
          <motion.div
            className={`relative h-2 w-2 rounded-full ${dotColor}`}
            animate={dotAnimation ? {
              scale: [1, 1.2, 1],
            } : {}}
            transition={dotAnimation ? {
              duration: 1.5,
              repeat: Infinity,
              ease: [0.42, 0, 0.58, 1],
            } : {}}
          >
            {dotAnimation && (
              <motion.div
                className={`absolute inset-0 rounded-full ${dotColor}`}
                animate={{
                  scale: [1, 2, 2.5],
                  opacity: [0.7, 0.3, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: [0, 0, 0.58, 1],
                }}
              />
            )}
          </motion.div>
        )}
        <span className="capitalize">{children || statusVariant.replace('-', ' ')}</span>
      </motion.div>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants };