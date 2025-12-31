/**
 * API route for handling chat requests to the AI task assistant
 * This connects the frontend chat component to the backend AI agent
 */

import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define types for our API
interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

interface TaskAgentResponse {
  success: boolean;
  message: string;
  task?: Task;
  tasks?: Task[];
}

// Task agent functions that will call our backend API
class TaskAPIAgent {
  private baseUrl: string;
  private authToken: string;

  constructor(userId: string, authToken: string) {
    this.baseUrl = `${process.env.BACKEND_API_URL || 'http://localhost:8000'}/api/${userId}/tasks`;
    this.authToken = authToken;
  }

  async addTask(title: string, description: string = "", priority: string = "medium", dueDate: string = ""): Promise<TaskAgentResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          title,
          description,
          completed: false,
          priority,
          due_date: dueDate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const task = await response.json();
        return {
          success: true,
          message: `Task "${title}" has been added successfully!`,
          task
        };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          message: `Failed to add task: ${errorText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error adding task: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async listTasks(status: string = "all", priority: string = "all"): Promise<TaskAgentResponse> {
    try {
      let url = this.baseUrl;
      const params = new URLSearchParams();
      if (status !== "all") params.append('status', status);
      if (priority !== "all") params.append('priority', priority);

      if ([...params.keys()].length > 0) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (response.ok) {
        const tasks = await response.json();

        if (tasks.length === 0) {
          return {
            success: true,
            message: "You don't have any tasks at the moment."
          };
        }

        let message = `You have ${tasks.length} task(s):\n`;
        tasks.forEach((task: Task) => {
          const status = task.completed ? "completed" : "pending";
          message += `- [${status}] ${task.title} (ID: ${task.id})\n`;
        });

        return {
          success: true,
          message,
          tasks
        };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          message: `Failed to list tasks: ${errorText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error listing tasks: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async updateTask(taskId: number, updates: Partial<Task>): Promise<TaskAgentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          ...updates,
          updated_at: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const task = await response.json();
        return {
          success: true,
          message: `Task "${task.title}" has been updated successfully!`,
          task
        };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          message: `Failed to update task: ${errorText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error updating task: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async deleteTask(taskId: number): Promise<TaskAgentResponse> {
    try {
      // First get the task to know its title
      const getResponse = await fetch(`${this.baseUrl}/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      let taskTitle = `Task ${taskId}`;
      if (getResponse.ok) {
        const task = await getResponse.json();
        taskTitle = task.title;
      }

      const response = await fetch(`${this.baseUrl}/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (response.ok) {
        return {
          success: true,
          message: `Task "${taskTitle}" has been deleted successfully!`
        };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          message: `Failed to delete task: ${errorText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error deleting task: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async completeTask(taskId: number): Promise<TaskAgentResponse> {
    return this.updateTask(taskId, { completed: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userId } = body;

    // Get user's auth token from headers or session
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const authToken = authHeader.replace('Bearer ', '');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize the task API agent
    const taskAgent = new TaskAPIAgent(userId, authToken);

    // Create a completion using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Using GPT-4 for better understanding of task management
      messages: messages,
      functions: [
        {
          name: 'add_task',
          description: 'Add a new task with title, description, priority, and due date',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'The title of the task' },
              description: { type: 'string', description: 'The description of the task' },
              priority: { type: 'string', description: 'Priority of the task (high, medium, low)', default: 'medium' },
              due_date: { type: 'string', description: 'Due date for the task in YYYY-MM-DD format', default: '' }
            },
            required: ['title']
          }
        },
        {
          name: 'list_tasks',
          description: 'List all tasks with optional filtering by status and priority',
          parameters: {
            type: 'object',
            properties: {
              status: { type: 'string', description: 'Filter by status (all, completed, pending)', default: 'all' },
              priority: { type: 'string', description: 'Filter by priority (all, high, medium, low)', default: 'all' }
            }
          }
        },
        {
          name: 'update_task',
          description: 'Update an existing task by ID',
          parameters: {
            type: 'object',
            properties: {
              task_id: { type: 'integer', description: 'The ID of the task to update' },
              title: { type: 'string', description: 'New title for the task' },
              description: { type: 'string', description: 'New description for the task' },
              completed: { type: 'boolean', description: 'Whether the task is completed' },
              priority: { type: 'string', description: 'New priority for the task (high, medium, low)' },
              due_date: { type: 'string', description: 'New due date for the task in YYYY-MM-DD format' }
            },
            required: ['task_id']
          }
        },
        {
          name: 'delete_task',
          description: 'Delete a task by ID',
          parameters: {
            type: 'object',
            properties: {
              task_id: { type: 'integer', description: 'The ID of the task to delete' }
            },
            required: ['task_id']
          }
        },
        {
          name: 'complete_task',
          description: 'Mark a task as completed by ID',
          parameters: {
            type: 'object',
            properties: {
              task_id: { type: 'integer', description: 'The ID of the task to mark as completed' }
            },
            required: ['task_id']
          }
        }
      ],
      function_call: 'auto',
    });

    const responseMessage = completion.choices[0].message;

    // If the model wants to call a function
    if (responseMessage.function_call) {
      const functionName = responseMessage.function_call.name;
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);

      let functionResponse: TaskAgentResponse;

      switch (functionName) {
        case 'add_task':
          functionResponse = await taskAgent.addTask(
            functionArgs.title,
            functionArgs.description,
            functionArgs.priority,
            functionArgs.due_date
          );
          break;
        case 'list_tasks':
          functionResponse = await taskAgent.listTasks(
            functionArgs.status,
            functionArgs.priority
          );
          break;
        case 'update_task':
          // Prepare update object with only the fields that are provided
          const updateData: Partial<Task> = {};
          if (functionArgs.title !== undefined) updateData.title = functionArgs.title;
          if (functionArgs.description !== undefined) updateData.description = functionArgs.description;
          if (functionArgs.completed !== undefined) updateData.completed = functionArgs.completed;
          if (functionArgs.priority !== undefined) updateData.priority = functionArgs.priority;
          if (functionArgs.due_date !== undefined) updateData.due_date = functionArgs.due_date;

          functionResponse = await taskAgent.updateTask(
            functionArgs.task_id,
            updateData
          );
          break;
        case 'delete_task':
          functionResponse = await taskAgent.deleteTask(functionArgs.task_id);
          break;
        case 'complete_task':
          functionResponse = await taskAgent.completeTask(functionArgs.task_id);
          break;
        default:
          functionResponse = {
            success: false,
            message: `Unknown function: ${functionName}`
          };
      }

      // Send the function response back to the model to generate a final response
      const secondResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          ...messages,
          responseMessage,
          {
            role: 'function',
            name: functionName,
            content: JSON.stringify(functionResponse),
          }
        ],
      });

      return new Response(
        JSON.stringify({ content: secondResponse.choices[0].message.content }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If no function was called, return the model's response directly
    return new Response(
      JSON.stringify({ content: responseMessage.content || "I didn't understand that. Could you rephrase?" }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}