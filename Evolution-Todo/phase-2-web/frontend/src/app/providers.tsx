'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/toast';
import { TransitionProvider } from '@/contexts/transition-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TransitionProvider transitionType="fade">
        <ToastProvider>
          {children}
        </ToastProvider>
      </TransitionProvider>
    </ThemeProvider>
  );
}