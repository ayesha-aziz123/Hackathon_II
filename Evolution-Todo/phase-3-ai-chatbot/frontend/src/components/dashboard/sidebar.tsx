"use client"
import { HomeIcon, PlusCircledIcon, PersonIcon, ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // On desktop, expand sidebar when hovered
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false) // Mobile always collapsed
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navItems = [
    {
      icon: HomeIcon,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: PlusCircledIcon,
      label: "Tasks",
      href: "/dashboard/tasks",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/dashboard/settings",
    },
  ]

  const sidebarVariants = {
    collapsed: {
      width: "3.5rem", // 56px
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 300,
        duration: 0.3
      }
    },
    expanded: {
      width: "16rem", // 256px
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 300,
        duration: 0.3
      }
    }
  }

  const navItemVariants = {
    collapsed: {
      x: 0,
      transition: {
        duration: 0.2
      }
    },
    expanded: {
      x: 0,
      transition: {
        duration: 0.3
      }
    }
  }

  const shouldExpand = isExpanded || isHovered

  return (
    <motion.aside
      className="h-full flex-col border-r bg-white/10 backdrop-blur-lg dark:bg-gray-900/80 dark:border-gray-700/50 overflow-hidden"
      variants={sidebarVariants}
      animate={shouldExpand ? "expanded" : "collapsed"}
      initial={false}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <nav className="flex flex-col items-center gap-4 px-2 py-6 h-full">
        {/* Logo section */}
        <div className="flex items-center justify-between w-full px-2 mb-6">
          <AnimatePresence>
            {shouldExpand && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-2"
              >
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Evolution Todo
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-white/20"
          >
            {shouldExpand ? <ChevronLeftIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>

        {/* Navigation items */}
        <div className="flex flex-col items-center gap-2 flex-1 w-full">
          <TooltipProvider>
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <motion.div
                  key={index}
                  variants={navItemVariants}
                  animate={shouldExpand ? "expanded" : "collapsed"}
                  className="w-full"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={`group flex items-center rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-accent text-accent-foreground hover:bg-accent/90"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/20"
                        } ${shouldExpand ? "px-3 py-3 w-full" : "justify-center h-12 w-12"}`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-3"
                        >
                          <Icon className="h-5 w-5" />
                          <AnimatePresence>
                            {shouldExpand && (
                              <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="whitespace-nowrap text-sm font-medium"
                              >
                                {item.label}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </Link>
                    </TooltipTrigger>
                    {!shouldExpand && (
                      <TooltipContent side="right" className="z-50">
                        {item.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </motion.div>
              )
            })}
          </TooltipProvider>
        </div>

       
      </nav>
    </motion.aside>
  )
}