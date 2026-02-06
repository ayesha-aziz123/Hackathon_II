"use client";

import * as React from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { Task } from "@/lib/types";
import { api } from "@/lib/api";
import { TaskList } from "../../../components/tasks/task-list";
import { TaskForm } from "../../../components/tasks/task-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function DashboardTasksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Redirect to sign-in if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  React.useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const tasksData = await api.getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      await api.deleteTask(taskId);
      setTasks(tasks.filter((task) => task.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    if (!user) return;

    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                completed,
                completed_at: completed ? new Date().toISOString() : null,
              }
            : t
        )
      );

      await api.completeTask(taskId, completed);
      toast.success(`Task ${completed ? "completed" : "marked as incomplete"}`);
    } catch (error) {
      console.error("Failed to toggle task completion:", error);
      // Revert optimistic update
      fetchTasks();
      toast.error("Failed to update task");
    }
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmitTask = async (data: any) => {
    if (!user || isSubmitting) return; // ✅ Prevent duplicate submissions

    setIsSubmitting(true);
    try {
      if (editingTask) {
        const updatedTask = await api.updateTask(editingTask.id, data);
        setTasks(
          tasks.map((task) => (task.id === editingTask.id ? updatedTask : task))
        );
        toast.success("Task updated successfully");
      } else {
        const newTask = await api.createTask(data);
        setTasks([...tasks, newTask]);
        toast.success("Task created successfully");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save task:", error);
      toast.error(
        editingTask ? "Failed to update task" : "Failed to create task"
      );
    } finally {
      setIsSubmitting(false); // ✅ Reset guard
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 rounded-full animate-spin border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect will happen via useEffect
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your tasks efficiently</p>
        </div>
      </div>

      <TaskList
        tasks={tasks}
        onAddTask={handleAddTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onToggleComplete={handleToggleComplete}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Edit Task" : "Create New Task"}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            initialData={editingTask || undefined}
            onSubmit={handleSubmitTask}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
