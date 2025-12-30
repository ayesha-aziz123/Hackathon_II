"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedInputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  glassmorphism?: boolean;
}

const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, label, error, glassmorphism = true, type, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(!!props.value);

    React.useEffect(() => {
      setHasValue(!!props.value);
    }, [props.value]);

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const inputClasses = cn(
      "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
      glassmorphism
        ? "bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-gray-700/50"
        : "bg-transparent border-input",
      "h-12 w-full min-w-0 rounded-lg border px-3 py-2 text-base shadow-sm transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
      error ? "border-destructive ring-destructive/20 dark:ring-destructive/40" : "",
      className
    );

    return (
      <div className="relative w-full">
        <div className="relative">
          <input
            type={type}
            data-slot="input"
            ref={ref}
            className={inputClasses}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          {label && (
            <motion.label
              className={cn(
                "absolute left-3 px-1 text-sm font-medium transition-all",
                glassmorphism
                  ? "bg-white/30 dark:bg-black/30 backdrop-blur-sm"
                  : "bg-background",
                "pointer-events-none",
                (isFocused || hasValue)
                  ? "-translate-y-6 scale-75 text-muted-foreground top-0"
                  : "top-3 text-foreground/70"
              )}
              initial={{ y: 0, scale: 1 }}
              animate={{
                y: isFocused || hasValue ? -18 : 0,
                scale: isFocused || hasValue ? 0.75 : 1,
              }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {label}
            </motion.label>
          )}
        </div>
        {error && (
          <motion.div
            className="mt-1 text-sm text-destructive flex items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            key={error}
          >
            <span>{error}</span>
          </motion.div>
        )}
      </div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";

export { AnimatedInput };