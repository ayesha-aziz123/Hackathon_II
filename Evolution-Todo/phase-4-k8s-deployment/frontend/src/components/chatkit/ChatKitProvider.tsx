

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, auth } from "@/lib/auth";

interface ChatKitConfig {
  apiUrl: string;
  userId: string;
  token: string;
}

const ChatKitConfigContext = createContext<ChatKitConfig | undefined>(undefined);

interface ChatKitProviderProps {
  children: ReactNode;
}

export const ChatKitProvider: React.FC<ChatKitProviderProps> = ({ children }) => {
  const { data: session } = useSession();

  // Get user data from auth
  const user = auth.getCurrentUser();
  const token = auth.getToken();

  if (!user || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to use the chat</p>
        </div>
      </div>
    );
  }

  const config: ChatKitConfig = {
    apiUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/${user.id}/chat`,
    userId: user.id,
    token: token,
  };

  console.log('✅ ChatKit Config:', config);

  return (
    <ChatKitConfigContext.Provider value={config}>
      {children}
    </ChatKitConfigContext.Provider>
  );
};

export const useChatKitConfig = () => {
  const context = useContext(ChatKitConfigContext);
  if (context === undefined) {
    throw new Error('useChatKitConfig must be used within a ChatKitProvider');
  }
  return context;
};