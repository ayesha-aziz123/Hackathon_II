import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to get dark theme variants of colors
export function getDarkThemeColor(lightColor: string): string {
  // This function returns the appropriate dark theme variant of a color
  // For now, we'll map some common light theme colors to dark theme equivalents
  const colorMap: Record<string, string> = {
    '#f9fafb': '#0f172a', // background.light -> background.dark
    '#ffffff': '#1e293b', // surface.light -> surface.dark
    '#0ea5e9': '#38bdf8', // primary.500 -> primary.400 (for contrast)
    '#8b5cf6': '#a78bfa', // secondary.500 -> secondary.400 (for contrast)
    '#111827': '#f9fafb', // neutral.900 -> background.light (for contrast)
    '#e5e7eb': '#374151', // neutral.200 -> neutral.700
    '#f3f4f6': '#374151', // neutral.100 -> neutral.700
    '#6b7280': '#9ca3af', // neutral.500 -> neutral.400
    '#ef4444': '#f87171', // status.error -> lighter red for contrast
  };

  return colorMap[lightColor] || lightColor;
}

// Utility function to check if dark mode is enabled
export function isDarkMode(): boolean {
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark');
  }
  return false;
}

// Utility function to apply glassmorphism effect with theme awareness
export function getGlassThemeClasses(isDark?: boolean): string {
  return isDark
    ? 'bg-[#1e293b]/75 backdrop-blur-md border border-white/10'
    : 'bg-white/75 backdrop-blur-md border border-white/18';
}



export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Not set";
  
  try {
    const date = new Date(dateString);
    
    // Check if valid date
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    // Format to local time (Pakistan Time in your case)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error('Date formatting error:', error);
    return "Invalid date";
  }
}

// ✅ Optional: Relative time (e.g., "2 hours ago")
export function formatRelativeDate(dateString: string | null | undefined): string {
  if (!dateString) return "Not set";
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return formatDate(dateString);
  } catch {
    return "Invalid date";
  }
}
