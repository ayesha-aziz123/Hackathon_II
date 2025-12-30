"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { Variants, Transition } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AnimatedInput } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskCreate } from "@/lib/types";

// ✅ Enhanced validation schema
const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less")
    .refine((val) => val.trim().length > 0, {
      message: "Title cannot be empty or just spaces",
    }),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional()
    .or(z.literal("")),
  priority: z.enum(["low", "medium", "high"], {
    message: "Please select a priority", // ✅ use `message` instead of required_error
  }),

  due_date: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        const selectedDate = new Date(date);
        const now = new Date();
        return selectedDate > now;
      },
      {
        message: "Due date must be in the future",
      }
    ),
  tags: z
    .string()
    .max(200, "Tags must be 200 characters or less")
    .optional()
    .or(z.literal("")),
  notification_time_before: z
    .number()
    .min(0, "Notification time must be non-negative")
    .optional()
    .or(z.nan()),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  initialData?: Partial<TaskCreate>;
  onSubmit: (data: TaskFormValues) => void;
  onCancel: () => void;
}

const getPakistanDateTime = () => {
  const now = new Date();
  const pakistanOffset = 5 * 60; // PKT = UTC+5
  const local = new Date(now.getTime() + pakistanOffset * 60000);
  return local.toISOString().slice(0, 16);
};

export function TaskForm({ initialData, onSubmit, onCancel }: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      priority: initialData?.priority || "medium",
      due_date: initialData?.due_date || "",
      tags: initialData?.tags || "",
      notification_time_before: initialData?.notification_time_before,
    },
    mode: "onChange",
  });

  const handleSubmit = (data: TaskFormValues) => {
    const cleanedData = {
      ...data,
      description: data.description || undefined,
      tags: data.tags || undefined,
      due_date: data.due_date || undefined,
      notification_time_before: data.notification_time_before || undefined,
    };
    onSubmit(cleanedData);
  };

  // Animation variants for form sections
  const parentTransition: Transition = {
    duration: 0.3,
    ease: "easeOut", // ✅ string literal
    staggerChildren: 0.1, // ✅ staggerChildren allowed in Transition
  };

  const formSectionVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: parentTransition,
    },
  };

  const fieldVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" }, // no staggerChildren here
    },
  };

  return (
    <Form {...form}>
      <motion.form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 w-full"
        initial="hidden"
        animate="visible"
        variants={formSectionVariants}
      >
        {/* Title Field */}
        <motion.div variants={fieldVariants}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <AnimatedInput
                    placeholder="Enter task title"
                    {...field}
                    className={cn(
                      form.formState.errors.title &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                </FormControl>
                <FormMessage className="text-red-600 text-sm" />
              </FormItem>
            )}
          />
        </motion.div>

        {/* Description Field */}
        <motion.div variants={fieldVariants}>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add task description (optional)"
                    className={cn(
                      "resize-none",
                      form.formState.errors.description && "border-red-500"
                    )}
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Max 1000 characters
                </FormDescription>
                <FormMessage className="text-red-600 text-sm" />
              </FormItem>
            )}
          />
        </motion.div>

        {/* Priority Field */}
        <motion.div variants={fieldVariants}>
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      className={cn(
                        form.formState.errors.priority && "border-red-500"
                      )}
                    >
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Low
                      </span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        Medium
                      </span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        High
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600 text-sm" />
              </FormItem>
            )}
          />
        </motion.div>

        {/* Due Date & Time Field */}
        <motion.div variants={fieldVariants}>
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date & Time (Pakistan Time)</FormLabel>
                <FormControl>
                  {/* <AnimatedInput
                    type="datetime-local"
                    {...field}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        // Convert datetime-local string to proper ISO format
                        // const date = new Date(e.target.value);
                        field.onChange(e.target.value)

                      } else {
                        field.onChange("");
                      }
                    }}
                    min={new Date().toISOString().slice(0, 16)}
                    className={cn(
                      form.formState.errors.due_date && "border-red-500"
                    )}
                  /> */}
                  <AnimatedInput
                    type="datetime-local"
                    value={field.value || getPakistanDateTime()}
                    onChange={(e) => field.onChange(e.target.value)}
                    className={cn(
                      form.formState.errors.due_date && "border-red-500"
                    )}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Select deadline in Pakistan Time. Backend will store in UTC.
                </FormDescription>
                <FormMessage className="text-red-600 text-sm" />
              </FormItem>
            )}
          />
        </motion.div>

        {/* Tags Field */}
        <motion.div variants={fieldVariants}>
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <AnimatedInput
                    placeholder="work, personal, urgent"
                    {...field}
                    className={cn(
                      form.formState.errors.tags && "border-red-500"
                    )}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Separate tags with commas (max 200 chars)
                </FormDescription>
                <FormMessage className="text-red-600 text-sm" />
              </FormItem>
            )}
          />
        </motion.div>

        {/* Notification Field */}
        <motion.div variants={fieldVariants}>
          <FormField
            control={form.control}
            name="notification_time_before"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notification (minutes before due)</FormLabel>
                <FormControl>
                  <AnimatedInput
                    type="number"
                    placeholder="e.g., 30"
                    min="0"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? parseInt(value, 10) : undefined);
                    }}
                    value={field.value ?? ""}
                    className={cn(
                      form.formState.errors.notification_time_before &&
                        "border-red-500"
                    )}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Get notified before the due date (optional)
                </FormDescription>
                <FormMessage className="text-red-600 text-sm" />
              </FormItem>
            )}
          />
        </motion.div>

        {/* Form Actions */}
        <motion.div
          className="flex justify-end space-x-3 pt-4 border-t"
          variants={fieldVariants}
        >
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !form.formState.isValid}
          >
            {form.formState.isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : initialData?.title ? (
              "Update Task"
            ) : (
              "Create Task"
            )}
          </Button>
        </motion.div>
      </motion.form>
    </Form>
  );
}
