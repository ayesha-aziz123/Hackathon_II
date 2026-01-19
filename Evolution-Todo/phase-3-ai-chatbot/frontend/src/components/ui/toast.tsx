"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Cross2Icon } from "@radix-ui/react-icons";

const toastVariants = cva(
  "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all backdrop-blur-md",
  {
    variants: {
      variant: {
        default: "bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 text-foreground",
        destructive:
          "bg-destructive/20 dark:bg-destructive/30 border-destructive/30 dark:border-destructive/50 text-destructive dark:text-destructive-foreground",
        success:
          "bg-green-100/30 dark:bg-green-900/30 border-green-200/30 dark:border-green-800/40 text-green-700 dark:text-green-300",
        info:
          "bg-blue-100/30 dark:bg-blue-900/30 border-blue-200/30 dark:border-blue-800/40 text-blue-700 dark:text-blue-300",
        warning:
          "bg-yellow-100/30 dark:bg-yellow-900/30 border-yellow-200/30 dark:border-yellow-800/40 text-yellow-700 dark:text-yellow-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ToastProps extends
  VariantProps<typeof toastVariants>
{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
  showCloseButton?: boolean;
  children: React.ReactNode;
  className?: string;
}




const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, open = true, onOpenChange, duration = 3000, showCloseButton = true, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(open);

    React.useEffect(() => {
      setIsOpen(open);
    }, [open]);

    React.useEffect(() => {
      if (isOpen && duration > 0) {
        const timer = setTimeout(() => {
          setIsOpen(false);
          if (onOpenChange) {
            onOpenChange(false);
          }
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [isOpen, duration, onOpenChange]);

    const handleClose = () => {
      setIsOpen(false);
      if (onOpenChange) {
        onOpenChange(false);
      }
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={ref}
            className={cn(toastVariants({ variant }), className)}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            {...props}
            // {...restProps} // safe spread without onDrag
          >
            <div className="flex-1">{children}</div>
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="opacity-70 hover:opacity-100 transition-opacity rounded-md p-1 hover:bg-black/10 dark:hover:bg-white/10"
                aria-label="Close"
              >
                <Cross2Icon className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

Toast.displayName = "Toast";

interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastContextType {
  addToast: (toast: ToastData) => void;
}

interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'info' | 'warning';
  duration?: number;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const addToast = (toast: ToastData) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [
      ...prev,
      { ...toast, id }
    ]);

    // Auto-remove toast after its duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration || 3000);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              variant={toast.variant}
              duration={toast.duration}
              onOpenChange={() => removeToast(toast.id)}
            >
              {toast.title && <div className="font-semibold">{toast.title}</div>}
              {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
            </Toast>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export { Toast, ToastProvider, useToast, toastVariants };