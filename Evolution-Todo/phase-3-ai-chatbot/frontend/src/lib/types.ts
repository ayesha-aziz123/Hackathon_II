// Frontend type definitions for the Todo application

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  tags?: string;
  due_date?: string; // ISO date string
  completed: boolean;
  completed_at?: string | null; // ISO date string
  notification_time_before?: number; // Minutes before due time
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  tags?: string;
  due_date?: string; // ISO date string
  notification_time_before?: number; // Minutes before due time
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  tags?: string;
  due_date?: string; // ISO date string
  completed?: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly';
  recurrence_end_date?: string; // ISO date string
  notification_time_before?: number; // Minutes before due time
}

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  is_active: boolean;
}