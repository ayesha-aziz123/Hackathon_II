"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Calendar, Tag, Bell, AlertCircle } from "lucide-react";
import { TaskCreate } from "@/lib/types";
import { Variants, Transition } from "framer-motion";

interface TaskFormModalProps {
  onClose: () => void;
  onSubmit: (taskData: TaskCreate) => Promise<void>;
}

export function TaskFormModal({ onClose, onSubmit }: TaskFormModalProps) {
  const [formData, setFormData] = useState<TaskCreate>({
    title: "",
    description: "",
    priority: "medium",
    tags: "",
    due_date: "",
    notification_time_before: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (formData.title.length > 255) {
      newErrors.title = "Title must be 255 characters or less";
    }

    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      if (dueDate < new Date()) {
        newErrors.due_date = "Due date must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error: any) {
      console.error("Failed to create task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Animation variants
  const springTransition: Transition = {
    type: "spring",
    damping: 25,
    stiffness: 300,
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: springTransition,
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.98,
      transition: { duration: 0.2 }, // default is tween
    },
  };

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5 },
  };

  const priorityOptions = [
    {
      value: "high",
      label: "High",
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
    {
      value: "medium",
      label: "Medium",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    {
      value: "low",
      label: "Low",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          className="absolute inset-0 bg-black"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/95">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Create New Task
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Add details for your new task
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                onClick={onClose}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {/* Title Field */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="title"
                      className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                    >
                      Task Title *
                    </label>
                    {errors.title && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter task title"
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                      errors.title
                        ? "border-red-500 ring-red-500 dark:border-red-500 dark:ring-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600"
                    } dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe your task (optional)"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  />
                </div>

                {/* Priority and Due Date Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Priority Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="priority"
                      className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                    >
                      Priority
                    </label>
                    <div className="relative">
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer"
                      >
                        {priorityOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div
                          className={`px-2 py-1 rounded-md text-xs font-medium ${priorityOptions.find((o) => o.value === formData.priority)?.color}`}
                        >
                          {
                            priorityOptions.find(
                              (o) => o.value === formData.priority
                            )?.label
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Due Date Field */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <label
                        htmlFor="due_date"
                        className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                      >
                        Due Date & Time
                      </label>
                    </div>
                    <input
                      type="datetime-local"
                      id="due_date"
                      name="due_date"
                      value={
                        formData.due_date
                          ? formData.due_date.replace("Z", "")
                          : ""
                      }
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.due_date
                          ? "border-red-500 ring-red-500 dark:border-red-500 dark:ring-red-500"
                          : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600"
                      } dark:bg-gray-700 dark:text-white`}
                    />
                    {errors.due_date && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.due_date}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tags and Notification Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Tags Field */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <label
                        htmlFor="tags"
                        className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                      >
                        Tags
                      </label>
                    </div>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="work, personal, urgent"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Separate with commas
                    </p>
                  </div>

                  {/* Notification Field */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <label
                        htmlFor="notification_time_before"
                        className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                      >
                        Notification (minutes before)
                      </label>
                    </div>
                    <input
                      type="number"
                      id="notification_time_before"
                      name="notification_time_before"
                      value={formData.notification_time_before || ""}
                      onChange={handleChange}
                      min="0"
                      max="10080" // One week in minutes
                      placeholder="e.g., 15"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Optional reminder before due time
                    </p>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-5 py-2.5 w-full sm:w-auto border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Task...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Create Task</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
