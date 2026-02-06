'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from 'next-themes';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import DashboardAIChatPanel from '@/components/DashboardAIChatPanel';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiChatVisible, setAiChatVisible] = useState(false);

  useEffect(() => {
    const handleAiAssistantToggle = () => {
      setAiChatVisible(prev => !prev);
    };

    window.addEventListener('ai-assistant-toggle', handleAiAssistantToggle);

    return () => {
      window.removeEventListener('ai-assistant-toggle', handleAiAssistantToggle);
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="relative h-screen bg-background text-foreground ">
        {/* Mobile header with menu button */}
        <div className="md:hidden p-4 border-b flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Link href={''}>Evolution Todo</Link>
          </div>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        {/* Mobile Sidebar Backdrop */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 dark:bg-gray-900/80 dark:border-gray-700/50 md:hidden"
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <div className="hidden md:block fixed inset-y-0 left-0 z-30 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className={`flex-1 overflow-auto transition-all duration-300 ${aiChatVisible ? 'md:ml-64 md:mr-[41.666667%]' : 'md:ml-64'} p-4 md:p-6`}>
          {children}
        </main>

        {/* AI Chat Panel - Only shown when visible */}
        {aiChatVisible && (
          <DashboardAIChatPanel
            isVisible={aiChatVisible}
            onClose={() => setAiChatVisible(false)}
          />
        )}

        {/* Mobile overlay when chat is open */}
        {aiChatVisible && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setAiChatVisible(false)}
          />
        )}
      </div>
    </ThemeProvider>
  );
}