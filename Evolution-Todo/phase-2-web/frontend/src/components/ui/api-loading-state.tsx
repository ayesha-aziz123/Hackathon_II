import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { loadingAnimation } from "@/lib/animations";

interface ApiLoadingStateProps {
  message?: string;
  className?: string;
}

const ApiLoadingState = ({
  message = "Loading...",
  className,
}: ApiLoadingStateProps) => {
  return (
    <div
      className={cn("flex flex-col items-center justify-center p-8", className)}
    >
      <motion.div
        className="w-12 h-12 rounded-full border-4 border-transparent border-t-primary border-r-primary border-b-transparent border-l-transparent"
        {...loadingAnimation}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: [0.25, 0.25, 0.75, 0.75], // linear bezier
        }}
      />
      <motion.p
        className="mt-4 text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
    </div>
  );
};

export { ApiLoadingState };
