"use client";

import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Task } from "@/lib/types";
import { Filter, Plus, Calendar, Clock, AlertCircle } from "lucide-react";
import { TaskFormModal } from "../../components/tasks/task-form-modal";

export default function TasksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    tags: "",
  });

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoadingTasks(true);
        const tasksData: Task[] = await api.getTasks();
        setTasks(tasksData);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoadingTasks(false);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect will happen via useEffect
  }

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter((task) => {
    const statusMatch =
      filters.status === "all" ||
      (filters.status === "active" && !task.completed) ||
      (filters.status === "completed" && task.completed) ||
      (filters.status === "pending" && !task.completed);

    const priorityMatch =
      filters.priority === "all" || task.priority === filters.priority;

    const tagMatch =
      !filters.tags ||
      (task.tags &&
        task.tags.toLowerCase().includes(filters.tags.toLowerCase()));

    return statusMatch && priorityMatch && tagMatch;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 100,
        duration: 0.4,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
        duration: 0.4,
      },
    },
    hover: {
      y: -5,
      boxShadow:
        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring" as const,
        damping: 15,
        stiffness: 300,
      },
    },
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mx-auto px-4 py-6 max-w-6xl"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              My Tasks
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome back, {user.name || user.email}!
            </p>
          </div>

          <Button
            className="h-12 px-4 flex items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <Plus className="h-5 w-5" />
            <span>Create Task</span>
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Filters:</span>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
              className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <input
              type="text"
              placeholder="Search tags..."
              value={filters.tags}
              onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 flex-1 min-w-[150px]"
            />
          </div>
        </div>
      </motion.div>

      {/* Task List */}
      <motion.div variants={itemVariants}>
        {loadingTasks ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border"
          >
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No tasks found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {tasks.length === 0
                ? "You don't have any tasks yet. Create your first task!"
                : "No tasks match your current filters."}
            </p>
            <Button className="mt-4" onClick={() => setShowModal(true)}>
              Create Task
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {task.title}
                    </h3>
                    <Badge
                      variant={task.completed ? "default" : "outline"}
                      className={`ml-2 ${task.completed ? "bg-green-500 hover:bg-green-500" : ""}`}
                    >
                      {task.completed ? "Completed" : "Active"}
                    </Badge>
                  </div>

                  {task.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge
                      variant={
                        task.priority === "high"
                          ? "destructive"
                          : task.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1)}
                    </Badge>

                    {task.tags && (
                      <Badge variant="outline" className="capitalize">
                        {task.tags}
                      </Badge>
                    )}
                  </div>

                  {task.due_date && (
                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {formatDate(task.due_date)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Here you would implement task editing
                        console.log("Edit task:", task.id);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showModal && (
          <TaskFormModal
            onClose={() => setShowModal(false)}
            onSubmit={async (taskData) => {
              try {
                const newTask = await api.createTask(taskData);
                setTasks([newTask, ...tasks]);
                setShowModal(false);
              } catch (error) {
                console.error("Failed to create task:", error);
              }
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
