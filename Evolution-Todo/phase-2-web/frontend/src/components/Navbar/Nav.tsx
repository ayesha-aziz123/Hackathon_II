"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Menu, X, Sparkles } from "lucide-react";
import { ThemeToggle } from "../ui/theme-toggle";
import { UserMenu } from "../auth/user-menu";
import { useSession } from "@/lib/auth";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const navItems = [
    { name: "Home", href: "#" },
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="text-white" />
            </div>
            <div>
              <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TodoFlow
              </p>
              <p className="text-xs text-gray-500">AI Productivity</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition"
              >
                {item.name}
              </Link>
            ))}

            <ThemeToggle />

            {!session && (
              <Link
                href="/sign-in"
                className="px-5 py-2 rounded-lg text-gray-200 bg-gray-700 dark:hover:bg-gray-800 dark:bg-gray-700"
              >
                Sign In
              </Link>
            )}

            {session && <UserMenu />}

            <Link
              href="/dashboard"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block py-2 text-gray-700 dark:text-gray-300"
              >
                {item.name}
              </Link>
            ))}

            {!session && (
              <Link href="/sign-in" className="block py-2 text-blue-600">
                Sign In
              </Link>
            )}

            {session && (
              <>
                <UserMenu />
                <Link
                  href="/dashboard"
                  className="block py-2 mt-2 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-center"
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Nav;
