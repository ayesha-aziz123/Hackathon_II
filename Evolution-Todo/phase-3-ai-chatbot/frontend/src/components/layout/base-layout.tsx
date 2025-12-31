'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface BaseLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function BaseLayout({
  children,
  header,
  footer,
  className = ''
}: BaseLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-background`}>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Todo App</h1>
          </div>

          <div className="flex items-center gap-4">
            {header}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.main
        className={`flex-1 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>

      {/* Footer */}
      {footer && (
        <footer className="py-6 md:px-8 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
}