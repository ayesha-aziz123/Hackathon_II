/**
 * ChatComponent.tsx
 *
 * AI Chatbot component using OpenAI ChatKit for natural language task management
 * This component provides a conversational interface for managing tasks through natural language
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { Message } from 'ai';

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

export default function ChatComponent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat({
    api: '/api/chat',
    body: {
      userId: typeof window !== 'undefined' ? localStorage.getItem('userId') : null
    },
    onResponse: () => setIsLoading(false),
    onFinish: () => setIsLoading(false),
    onError: (error) => {
      console.error('Chat error:', error);
      setIsLoading(false);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    handleSubmit(e);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    setIsLoading(true);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Chat Header */}
      <div className="bg-indigo-600 text-white p-4">
        <h2 className="text-xl font-semibold">AI Task Assistant</h2>
        <p className="text-sm opacity-80">Manage your tasks with natural language</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ maxHeight: '500px' }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="mb-4">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Welcome to your AI Task Assistant!</h3>
            <p className="text-gray-500 mb-4">I can help you manage your tasks using natural language.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-md">
              <button
                onClick={() => handleQuickAction("Add a task to buy groceries")}
                className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors"
              >
                Add Task
              </button>
              <button
                onClick={() => handleQuickAction("Show me my tasks")}
                className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors"
              >
                List Tasks
              </button>
              <button
                onClick={() => handleQuickAction("Mark task 1 as completed")}
                className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors"
              >
                Complete Task
              </button>
              <button
                onClick={() => handleQuickAction("Update my task to add more details")}
                className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors"
              >
                Update Task
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message: Message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-indigo-500 text-white rounded-tr-none'
                      : 'bg-gray-200 text-gray-800 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 rounded-tl-none max-w-[80%]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            value={input}
            placeholder="Ask me to add, list, update, or complete tasks..."
            onChange={handleInputChange}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Examples: "Add a task to buy milk", "Show my pending tasks", "Complete task 1"
        </p>
      </div>
    </div>
  );
}