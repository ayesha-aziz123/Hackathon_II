import { pgTable, serial, text, varchar, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

// User table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  password_hash: text('password_hash').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  is_active: boolean('is_active').default(true).notNull(),
});

// Task table
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  priority: varchar('priority', { enum: ['high', 'medium', 'low'] }).default('medium'),
  tags: text('tags'), // JSON string for user-defined tags
  due_date: timestamp('due_date'),
  completed: boolean('completed').default(false).notNull(),
  completed_at: timestamp('completed_at'),
  notification_time_before: integer('notification_time_before'), 
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});