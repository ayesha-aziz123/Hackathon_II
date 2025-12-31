import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const taskStatusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        pending: "border-transparent bg-yellow-100 text-yellow-800",
        "in-progress": "border-transparent bg-blue-100 text-blue-800",
        completed: "border-transparent bg-green-100 text-green-800",
        high: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        medium: "border-transparent bg-yellow-100 text-yellow-800",
        low: "border-transparent bg-green-100 text-green-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TaskStatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof taskStatusBadgeVariants> {
  status?: 'pending' | 'in-progress' | 'completed' | 'high' | 'medium' | 'low';
}

function TaskStatusBadge({ className, variant, status, ...props }: TaskStatusBadgeProps) {
  const statusVariant = status ? taskStatusBadgeVariants({ variant: status }) : taskStatusBadgeVariants({ variant });

  return (
    <div className={cn(statusVariant, className)} {...props} />
  )
}

export { TaskStatusBadge, taskStatusBadgeVariants }