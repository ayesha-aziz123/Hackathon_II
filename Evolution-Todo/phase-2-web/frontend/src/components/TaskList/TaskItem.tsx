import { useState } from 'react';
import { Task } from '@/lib/types';
import TaskForm from './TaskForm';

interface TaskItemProps {
  task: Task;
  onUpdate: (taskId: string, taskData: any) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
}

export default function TaskItem({ task, onUpdate, onDelete, onToggleComplete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (taskData: any) => {
    onUpdate(task.id, taskData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  const handleToggleComplete = () => {
    onToggleComplete(task.id, !task.completed);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${
      task.completed ? 'border-green-500' :
      task.priority === 'high' ? 'border-red-500' :
      task.priority === 'medium' ? 'border-yellow-500' : 'border-blue-500'
    }`}>
      {isEditing ? (
        <div>
          <h3 className="text-lg font-medium mb-2">Edit Task</h3>
          <TaskForm
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={handleToggleComplete}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="ml-3">
                <h3 className={`text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className={`mt-1 text-gray-600 ${task.completed ? 'line-through' : ''}`}>
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-700"
                title="Edit task"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700"
                title="Delete task"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className={`px-2 py-1 rounded-full text-xs ${
              task.priority === 'high' ? 'bg-red-100 text-red-800' :
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>

            {task.tags && (
              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">
                {task.tags}
              </span>
            )}

            {task.due_date && (
              <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">
                Due: {formatDate(task.due_date)}
              </span>
            )}

            {task.completed && task.completed_at && (
              <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                Completed: {formatDate(task.completed_at)}
              </span>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Created: {formatDate(task.created_at)}
            {task.updated_at !== task.created_at && (
              <span>, Updated: {formatDate(task.updated_at)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}