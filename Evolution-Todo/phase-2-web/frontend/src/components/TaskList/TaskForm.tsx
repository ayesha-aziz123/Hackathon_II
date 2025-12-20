"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { TaskCreate } from "@/lib/types";

interface TaskFormProps {
  onSubmit: (taskData: TaskCreate) => Promise<void>; // async bana diya
  onCancel: () => void;
  initialData?: Partial<TaskCreate>; // edit ke liye (future mein use hoga)
}

export default function TaskForm({
  onSubmit,
  onCancel,
  initialData = {},
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskCreate>({
    title: initialData.title || "",
    description: initialData.description || "",
    priority: initialData.priority || "medium",
    tags: initialData.tags || "",
    due_date: initialData.due_date || "",
    notification_time_before: initialData.notification_time_before || undefined,
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


    if (
      formData.notification_time_before !== undefined &&
      formData.notification_time_before < 0
    ) {
      newErrors.notification_time_before =
        "Notification time must be non-negative";
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
      [name]: value || undefined, // empty string ko undefined bana do optional fields ke liye
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success("Task created successfully!");
    } catch (error: any) {
      const message =
        error.message || "Failed to create task. Please try again.";
      toast.error(message);
      // Agar backend se detail aaya ho to dikhao
      if (error.message.includes("detail")) {
        toast.error("Server error: " + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
  
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.title
              ? "border-red-500 ring-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Priority & Due Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            required
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="due_date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Due Date & Time
          </label>
          <input
            type="datetime-local"
            id="due_date"
            name="due_date"
            required
            value={formData.due_date ? formData.due_date.replace("Z", "") : ""}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.due_date
                ? "border-red-500 ring-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
          />
          {errors.due_date && (
            <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
          )}
        </div>
      </div>

      {/* Tags & Notification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tags (comma-separated)
          </label>
          <input
            required
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="work, personal, urgent"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="notification_time_before"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notification (minutes before due)
          </label>
          <input
            type="number"
            id="notification_time_before"
            name="notification_time_before"
            value={formData.notification_time_before || ""}
            onChange={handleChange}
            min="0"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.notification_time_before
                ? "border-red-500 ring-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
          />
          {errors.notification_time_before && (
            <p className="mt-1 text-sm text-red-600">
              {errors.notification_time_before}
            </p>
          )}
        </div>
      </div>


      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2 rounded-md transition-colors"
        >
          {submitting ? "Creating..." : "Create Task"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
