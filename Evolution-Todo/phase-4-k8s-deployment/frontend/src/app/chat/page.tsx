


'use client';

import React from 'react';
import { ChatKitProvider } from '@/components/chatkit/ChatKitProvider';
import ChatKitWidget from '@/components/chatkit/ChatKitWidget';
import AuthCheck from '@/components/AuthCheck';

export default function ChatPage() {
  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">AI Task Assistant</h1>
            <p className="text-gray-600">
              Chat with your AI assistant to manage tasks naturally
            </p>
          </div>

          <ChatKitProvider>
            <ChatKitWidget />
          </ChatKitProvider>
        </div>
      </div>
    </AuthCheck>
  );
}