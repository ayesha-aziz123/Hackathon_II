"use client"
import * as React from "react"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserMenu } from "@/components/dashboard/user-menu"

type DashboardHeaderProps = {
  toggleSidebar?: () => void;
};

export function DashboardHeader({ toggleSidebar }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <button
          onClick={toggleSidebar}
          className="md:hidden mr-2 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 dark:bg-gray-800/80 dark:border-gray-600"
          aria-label="Toggle sidebar"
        >
          <div className="w-4 h-0.5 bg-foreground mb-1 rounded"></div>
          <div className="w-4 h-0.5 bg-foreground mb-1 rounded"></div>
          <div className="w-4 h-0.5 bg-foreground rounded"></div>
        </button>
        <span>Evolution Todo</span>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              {theme === "dark" ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <UserMenu />
      </div>
    </header>
  )
}