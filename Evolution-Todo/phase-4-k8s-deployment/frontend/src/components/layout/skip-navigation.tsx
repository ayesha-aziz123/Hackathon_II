import { cn } from '@/lib/utils';

const SkipNavigation = () => {
  return (
    <a
      href="#main-content"
      className={cn(
        'fixed top-4 left-4 z-[100] px-4 py-2 bg-primary text-primary-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'transform -translate-y-full focus-within:translate-y-0 transition-transform duration-200',
        'sr-only focus:not-sr-only'
      )}
    >
      Skip to main content
    </a>
  );
};

export { SkipNavigation };