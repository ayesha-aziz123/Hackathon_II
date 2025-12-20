'use client';

import { useState, useEffect, use } from 'react';
import { Task } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import { useRouter } from 'next/navigation';

interface TaskListProps {
  userId: string;
}

export default function TaskList() {
   const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm]= useState(false);
  const { user, session } = useAuth();  // Better-Auth se user/session le lo
  const router = useRouter();

  // Safe way to get userId
 const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;

if (!userId) {
 router.push("/sign-in")
}

  // Agar session se bhi mil jaaye to use kar lo
  const sessionUserId = session?.user?.id || user?.id;

  const effectiveUserId = userId || sessionUserId;

  useEffect(() => {
    if (effectiveUserId) {
      fetchTasks();
    } else {
      console.error('No user ID found! Redirect to login?');
      // optional: router.push('/sign-in');
    }
  }, [effectiveUserId]);

const fetchTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await api.getTasks(effectiveUserId!);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // createTask wagaira mein bhi effectiveUserId use karo
  const handleCreateTask = async (taskData: any) => {
  try {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      throw new Error('User ID not found. Please login again.');
    }

    // user_id ko body mein add kar do
    const taskDataWithUser = {
      ...taskData,
      user_id: userId,  // ← Ye add karo!
    };

    const newTask = await api.createTask(userId, taskDataWithUser);
    setTasks([...tasks, newTask]);
    setShowForm(false);
  } catch (error: any) {
    console.error('Failed to create task:', error);
    alert(error.message || 'Failed to create task');
  }
};

  // const handleUpdateTask = async (taskId: string, taskData: any) => {
  //   try {
  //     const updatedTask = await api.updateTask(userId, taskId, taskData);
  //     setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
  //   } catch (error) {
  //     console.error('Failed to update task:', error);
  //   }
  // };

  // const handleDeleteTask = async (taskId: string) => {
  //   try {
  //     await api.deleteTask(userId, taskId);
  //     setTasks(tasks.filter(task => task.id !== taskId));
  //   } catch (error) {
  //     console.error('Failed to delete task:', error);
  //   }
  // };

  // const handleToggleComplete = async (taskId: string, completed: boolean) => {
  //   try {
  //     const result = await api.completeTask(userId, taskId, completed);
  //     setTasks(tasks.map(task =>
  //       task.id === taskId ? { ...task, completed: result.completed, completed_at: result.completed ? new Date().toISOString() : null } : task
  //     ));
  //   } catch (error) {
  //     console.error('Failed to toggle task completion:', error);
  //   }
  // };


  const handleUpdateTask = async (taskId: string, taskData: any) => {
  try {
    const updatedTask = await api.updateTask(effectiveUserId!, taskId, taskData);
    setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
  } catch (error) {
    console.error('Failed to update task:', error);
    alert('Failed to update task');
  }
};

const handleDeleteTask = async (taskId: string) => {
  try {
    await api.deleteTask(effectiveUserId!, taskId);
    setTasks(tasks.filter(task => task.id !== taskId));
  } catch (error) {
    console.error('Failed to delete task:', error);
    alert('Failed to delete task');
  }
};

const handleToggleComplete = async (taskId: string, completed: boolean) => {
  try {
    const result = await api.completeTask(effectiveUserId!, taskId, completed);
    setTasks(tasks.map(task =>
      task.id === taskId 
        ? { ...task, completed: result.completed, completed_at: result.completed ? new Date().toISOString() : null } 
        : task
    ));
  } catch (error) {
    console.error('Failed to toggle task completion:', error);
    alert('Failed to update completion status');
  }
};



  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          {showForm ? 'Cancel' : 'Add New Task'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-3">Create New Task</h3>
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tasks yet. Create your first task!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
