'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession, auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExitIcon } from '@radix-ui/react-icons';
import { UserIcon, SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glassmorphism } from '@/lib/styles';

export function UserMenu() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSignOut = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');

      // Call custom auth signOut
      auth.signOut();

      // Redirect to sign-in
      router.push('/sign-in');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsOpen(false);
    }
  };

  const handleProfileClick = () => {
    router.push('/dashboard/profile');
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    router.push('/dashboard/settings');
    setIsOpen(false);
  };

  if (!session) {
    return null;
  }

  const user = session.user;

  // Calculate position for dropdown
  const calculatePosition = () => {
    if (!buttonRef.current) return { top: '100%', right: 0 };

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // Position dropdown from the right side of the button
    const rightOffset = viewportWidth - rect.right;

    return {
      top: `${rect.bottom + 8}px`,
      right: `${rightOffset}px`,
    };
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.15,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: [0.4, 0, 1, 1] as [number, number, number, number],
      }
    }
  };

  const menuItemVariants = {
    hidden: {
      opacity: 0,
      x: 10,
      y: -5,
      transition: {
        duration: 0.15,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.15,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }
    }
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        className="relative h-8 w-8 rounded-full overflow-hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={user.image || ""}
            alt={user.name || user.email || ""}
            className="object-cover"
          />
          <AvatarFallback className="text-xs">
            {user.name
              ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : user.email?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
            className={cn(
              "fixed z-50 w-64 mt-2 origin-top-right rounded-xl shadow-lg",
              glassmorphism.menu,
              "py-2 px-2 space-y-1"
            )}
            style={calculatePosition()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* User Info Section */}
            <motion.div
              className="px-4 py-3 border-b border-white/10 dark:border-gray-700/30"
              variants={menuItemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: 0.05 }}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user.image || ""}
                    alt={user.name || user.email || ""}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-sm">
                    {user.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Menu Items */}
            <motion.div
              className="space-y-1"
              initial={false}
              animate={{
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.1
                }
              }}
            >
              <motion.div variants={menuItemVariants}>
                <button
                  onClick={handleProfileClick}
                  className={cn(
                    "w-full flex items-center px-4 py-2 text-sm rounded-lg",
                    "text-gray-700 dark:text-gray-200",
                    "hover:bg-white/10 dark:hover:bg-gray-700/50",
                    "transition-colors duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500"
                  )}
                >
                  <UserIcon className="mr-3 h-4 w-4" />
                  <span>Profile</span>
                </button>
              </motion.div>

              <motion.div variants={menuItemVariants}>
                <button
                  onClick={handleSettingsClick}
                  className={cn(
                    "w-full flex items-center px-4 py-2 text-sm rounded-lg",
                    "text-gray-700 dark:text-gray-200",
                    "hover:bg-white/10 dark:hover:bg-gray-700/50",
                    "transition-colors duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500"
                  )}
                >
                  <SettingsIcon className="mr-3 h-4 w-4" />
                  <span>Settings</span>
                </button>
              </motion.div>

              <motion.div variants={menuItemVariants}>
                <button
                  onClick={handleSignOut}
                  className={cn(
                    "w-full flex items-center px-4 py-2 text-sm rounded-lg",
                    "text-red-600 dark:text-red-400",
                    "hover:bg-red-500/10",
                    "transition-colors duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-red-500"
                  )}
                >
                  <ExitIcon className="mr-3 h-4 w-4" />
                  <span>Log out</span>
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop when menu is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}