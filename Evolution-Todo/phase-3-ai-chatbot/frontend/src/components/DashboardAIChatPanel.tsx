'use client';

import React from 'react';
import AIChatPanel from './AIChatPanel';
import { ChatKitProvider } from './chatkit/ChatKitProvider';

interface DashboardAIChatPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function DashboardAIChatPanel({ isVisible, onClose }: DashboardAIChatPanelProps) {
  return (
    <ChatKitProvider>
      <AIChatPanel
        isVisible={isVisible}
        onClose={onClose}
      />
    </ChatKitProvider>
  );
}