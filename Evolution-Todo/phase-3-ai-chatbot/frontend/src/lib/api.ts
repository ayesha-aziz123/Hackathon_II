"use client";  

import { Task, TaskCreate, TaskUpdate } from './types';

// JWT decode helper
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT:', e);
    return null;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL;
  }

  private async getToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('auth_token');

    if (!token) {
      console.warn('⚠️ No auth token found. User needs to login.');
      return null;
    }

    return token;
  }

  // ✅ FIXED: Token se user ID extract karo (sub field se)
  private async getAuthenticatedUserId(): Promise<string | null> {
    const token = await this.getToken();
    console.log(token,"❤");
    
    if (!token) return null;

    const decoded = parseJwt(token);
    
    // Better-Auth "sub" field me user ID rakhta hai
    const userId = decoded?.sub || decoded?.user_id || decoded?.id;
    
    console.log('✅ Authenticated User ID:', userId);
    return userId;
  }
  
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

  // ✅ UPDATED: Extract userId from token internally
  async getTasks(): Promise<Task[]> {
    const authUserId = await this.getAuthenticatedUserId();
    if (!authUserId) throw new Error('User not authenticated');

    return this.request(`/${authUserId}/tasks`);
  }


async createTask(taskData: TaskCreate): Promise<Task> {
  const authUserId = await this.getAuthenticatedUserId();
  if (!authUserId) throw new Error('User not authenticated');

  // Prepare task data - remove undefined values
  const payload: any = {
    title: taskData.title.trim(),
    priority: taskData.priority || "medium",
  };

  // Only add optional fields if they have values
  if (taskData.description?.trim()) {
    payload.description = taskData.description.trim();
  }

  if (taskData.tags?.trim()) {
    payload.tags = taskData.tags.trim();
  }

  if (taskData.due_date) {
    // Ensure proper ISO format
    payload.due_date = taskData.due_date;
  }

  if (taskData.notification_time_before !== undefined && taskData.notification_time_before !== null) {
    payload.notification_time_before = taskData.notification_time_before;
  }

  console.log('📤 Sending task data:', payload);

  try {
    return await this.request(`/${authUserId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error: any) {
    console.error('❌ Create task failed:', error);
    throw new Error(error.message || 'Failed to create task');
  }
}


  
  async getTask(taskId: string): Promise<Task> {
    const authUserId = await this.getAuthenticatedUserId();
    if (!authUserId) throw new Error('User not authenticated');

    return this.request(`/${authUserId}/tasks/${taskId}`);
  }

  async updateTask(taskId: string, taskData: TaskUpdate): Promise<Task> {
    const authUserId = await this.getAuthenticatedUserId();
    if (!authUserId) throw new Error('User not authenticated');

    return this.request(`/${authUserId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    const authUserId = await this.getAuthenticatedUserId();
    if (!authUserId) throw new Error('User not authenticated');

    await this.request(`/${authUserId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async completeTask(taskId: string, completed: boolean): Promise<{ completed: boolean }> {
    const authUserId = await this.getAuthenticatedUserId();
    if (!authUserId) throw new Error('User not authenticated');

    return this.request(`/${authUserId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  }

  async searchTasks(query: string): Promise<Task[]> {
    const authUserId = await this.getAuthenticatedUserId();
    if (!authUserId) throw new Error('User not authenticated');

    return this.request(`/${authUserId}/tasks/search?q=${encodeURIComponent(query)}`);
  }

  // User profile and preferences API methods
  async getUserProfile(): Promise<any> {
    return this.request('/users/me');
  }

  async updateUserProfile(userData: any): Promise<any> {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateUserPreferences(preferencesData: any): Promise<any> {
    return this.request('/users/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferencesData),
    });
  }

  async updateUserPassword(passwordData: any): Promise<any> {
    return this.request('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async deleteUserAccount(): Promise<any> {
    return this.request('/users/me', {
      method: 'DELETE',
    });
  }

}

export const api = new ApiClient();