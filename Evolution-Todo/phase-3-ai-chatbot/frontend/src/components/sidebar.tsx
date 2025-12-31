'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PlusCircle, Settings, X, Menu, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from '@/lib/auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { data: session, isPending } = useSession();

  // Detect mobile and set initial state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false); // Always closed on mobile initially
      } else {
        // Load saved state only on desktop
        const savedState = localStorage.getItem('sidebar-open');
        if (savedState !== null) {
          setIsOpen(savedState === 'true');
        } else {
          setIsOpen(true); // Default open on desktop
        }
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save sidebar state to localStorage when it changes (desktop only)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-open', isOpen.toString());
    }
  }, [isOpen, isMobile]);

  const navItems = [
    {
      icon: Home,
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: PlusCircle,
      label: 'Tasks',
      href: '/dashboard/tasks',
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/dashboard/settings',
    },
  ];

  // Animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      width: isMobile ? '100%' : '256px',
      transition: {
        type: 'spring' as const,
        damping: 25,
        stiffness: 300,
        duration: 0.3
      }
    },
    closed: {
      x: isMobile ? '-100%' : 0,
      width: isMobile ? '100%' : '64px',
      transition: {
        duration: 0.2
      }
    }
  };

  const backdropVariants = {
    visible: {
      opacity: 0.5,
      transition: { duration: 0.2 }
    },
    hidden: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <>
      {/* Mobile menu toggle button when sidebar is closed */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`h-full flex flex-col border-r bg-white dark:bg-gray-900 z-50
          ${isMobile 
            ? 'fixed inset-y-0 left-0 max-w-full' 
            : 'relative'
          }`}
        variants={sidebarVariants}
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        style={isMobile ? {} : { height: '100%' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <Link href={'/'}>Evolution Todo</Link>
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center space-x-2">
            {/* Close button for mobile */}
            {isMobile && isOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            )}

            {/* Desktop toggle button */}
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={index}>
                  <Link href={item.href}>
                    <motion.div
                      className={`group flex items-center rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
                      } ${isOpen ? 'px-3 py-3' : 'justify-center p-3'}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => isMobile && setIsOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <AnimatePresence>
                          {isOpen && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              className="whitespace-nowrap text-sm font-medium"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-2 border-t flex flex-col gap-2">
          {/* Theme Toggle */}
          <div className={`${isOpen ? 'px-1 py-2' : 'py-2 flex justify-center'}`}>
             <ThemeToggle />
          </div>

          {/* User Profile and Logout */}
          {!isPending && session?.user ? (
            <div className={`w-full ${isOpen ? 'px-1' : 'flex justify-center'}`}>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || ''} alt={session.user.name || 'User'} />
                  <AvatarFallback className="text-xs">
                    {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {session.user.name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                    
                  </div>
                  
                )}
              </div>
            </div>
          ) : null}

          {/* Logout Button */}
          <Button
            variant="outline"
            className={`w-full ${isOpen ? 'justify-start' : 'justify-center'}`}
            onClick={() => signOut().then(() => {
              // Redirect to sign-in page after logout
              router.push('/sign-in');
            })}
          >
            <span className={isOpen ? 'flex items-center gap-3' : ''}>
              <LogOut className="h-5 w-5" />
              {isOpen && <span>Logout</span>}
            </span>
          </Button>
        </div>
      </motion.aside>
    </>
  );
}




