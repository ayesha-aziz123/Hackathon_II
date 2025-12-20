// import { auth } from './auth';

// class ApiClient {
//   private baseUrl: string;

//   constructor() {
//     this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
//   }

//   /**
//    * Makes an API request with proper authentication
//    */
//   async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
//     // Get the current session to access the JWT token
//     const session = await auth.getSession();
//     const token = session?.token;

//     const headers = {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     };

//     // Add authorization header if we have a token
//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }

//     const response = await fetch(`${this.baseUrl}${endpoint}`, {
//       ...options,
//       headers,
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
//     }

//     return response.json();
//   }

//   // User-related API methods
//   async getUsersTasks(userId: string) {
//     return this.request(`/users/${userId}/tasks`);
//   }

//   // Task-related API methods
//   async getTasks(userId: string) {
//     return this.request(`/${userId}/tasks`);
//   }

//   async createTask(userId: string, taskData: any) {
//     return this.request(`/${userId}/tasks`, {
//       method: 'POST',
//       body: JSON.stringify(taskData),
//     });
//   }

//   async getTask(userId: string, taskId: string) {
//     return this.request(`/${userId}/tasks/${taskId}`);
//   }

//   async updateTask(userId: string, taskId: string, taskData: any) {
//     return this.request(`/${userId}/tasks/${taskId}`, {
//       method: 'PUT',
//       body: JSON.stringify(taskData),
//     });
//   }

//   async deleteTask(userId: string, taskId: string) {
//     return this.request(`/${userId}/tasks/${taskId}`, {
//       method: 'DELETE',
//     });
//   }

//   async completeTask(userId: string, taskId: string, completed: boolean) {
//     return this.request(`/${userId}/tasks/${taskId}/complete`, {
//       method: 'PATCH',
//       body: JSON.stringify({ completed }),
//     });
//   }
// }

// export const api = new ApiClient();







"use client";  // ✅ Mark as client component

import { authClient } from './auth';
import { Task, TaskCreate, TaskUpdate } from './types';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  }

  /**
   * Get current JWT token from session
   */
  // private async getToken(): Promise<string | null> {
  //   try {
  //     // Use Better Auth client to get session
  //     const response = await fetch('/api/auth/session', {
  //       credentials: 'include',
  //     });
      
  //     if (!response.ok) return null;
      
  //     const session = await response.json();
  //     return session?.session?.token || null;
  //   } catch (error) {
  //     console.error('Failed to get token:', error);
  //     return null;
  //   }
  // }


  private async getToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('auth_token');

    if (!token) {
      console.warn('⚠️ No auth token found. User needs to login.');
      return null;
    }

    console.log('✅ Token found', token);
    return token;
  }
  
  /**
   * Makes an API request with proper authentication
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken();

    if (!token) {
      throw new Error('No authentication token. Please login again.');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    };

    console.log('📤 API Request:', {
      url: `${this.baseUrl}${endpoint}`,
      method: options.method || 'GET',
      hasToken: !!token
    });

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API Error:', {
        status: response.status,
        detail: errorData.detail
      });
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }


  
  // Task-related API methods
  async getTasks(userId: string): Promise<Task[]> {
    return this.request(`/${userId}/tasks`);
  }

  async createTask(userId: string, taskData: TaskCreate): Promise<Task> {
    return this.request(`/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async getTask(userId: string, taskId: string): Promise<Task> {
    return this.request(`/${userId}/tasks/${taskId}`);
  }

  async updateTask(userId: string, taskId: string, taskData: TaskUpdate): Promise<Task> {
    return this.request(`/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    await this.request(`/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async completeTask(userId: string, taskId: string, completed: boolean): Promise<{ completed: boolean }> {
    return this.request(`/${userId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  }
}

export const api = new ApiClient();