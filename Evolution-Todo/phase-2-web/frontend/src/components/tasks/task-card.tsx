"use client";

import { Task } from "@/lib/types";
import { motion, easeIn, easeOut, easeInOut } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { glassmorphism } from "@/lib/styles";
import { Badge } from "@/components/ui/badge";

interface TaskCardProps {
  task: Task;
  onComplete?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  className?: string;
}

export const TaskCard = ({
  task,
  onComplete,
  onDelete,
  onEdit,
}: TaskCardProps) => {
  const handleCompleteToggle = () => {
    if (onComplete) onComplete(task);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(task.id);
  };

  const handleEdit = () => {
    if (onEdit) onEdit(task);
  };

  // Animation variants for the card

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: easeOut, // ✅ TS-compatible
      },
    },
    hover: {
      y: -5,
      transition: {
        duration: 0.2,
        ease: easeInOut, // ✅ TS-compatible
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: easeIn, // ✅ TS-compatible
      },
    },
  };

  // Animation variants for menu items
  const menuItemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: easeOut,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.15,
        ease: easeIn,
      },
    },
  };

  // Priority badge styling
  const priorityClass = cn("text-xs font-medium", {
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300":
      task.priority === "high",
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300":
      task.priority === "medium",
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300":
      task.priority === "low",
  });

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover="hover"
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 shadow-lg",
        glassmorphism.card,
        "hover:shadow-xl transition-all duration-300"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCompleteToggle}
            className="h-6 w-6 p-0 flex-shrink-0 mt-0.5"
          >
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-medium text-left truncate",
                task.completed
                  ? "line-through text-gray-500 dark:text-gray-400"
                  : "text-gray-900 dark:text-gray-100"
              )}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {task.priority && (
                <Badge
                  variant="outline"
                  className={cn("text-xs px-2 py-1 border", priorityClass)}
                >
                  {task.priority}
                </Badge>
              )}

              {task.due_date && (
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(task.due_date).toLocaleDateString()}
                </div>
              )}

              {task.tags && (
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Tag className="h-3 w-3 mr-1" />
                  {task.tags}
                </div>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <motion.div
              variants={menuItemVariants}
              initial="hidden"
              animate="visible"
            >
              <DropdownMenuItem
                onClick={handleEdit}
                className="flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </motion.div>
            <motion.div
              variants={menuItemVariants}
              initial="hidden"
              animate={{
                ...menuItemVariants.visible,
                transition: { delay: 0.05 },
              }}
            >
              <DropdownMenuItem
                onClick={handleDelete}
                className="flex items-center text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {task.completed && task.completed_at && (
        <div className="mt-2 text-xs text-green-600 dark:text-green-400">
          Completed on {new Date(task.completed_at).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;
