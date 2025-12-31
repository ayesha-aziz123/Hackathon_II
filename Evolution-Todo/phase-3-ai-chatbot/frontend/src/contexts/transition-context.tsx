'use client';

import { createContext, useContext, ReactNode } from 'react';

type TransitionType = 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideFromRight';

interface TransitionContextType {
  transitionType: TransitionType;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

interface TransitionProviderProps {
  children: ReactNode;
  transitionType?: TransitionType;
}

export const TransitionProvider = ({
  children,
  transitionType = 'fade'
}: TransitionProviderProps) => {
  return (
    <TransitionContext.Provider value={{ transitionType }}>
      {children}
    </TransitionContext.Provider>
  );
};

export const useTransition = () => {
  const context = useContext(TransitionContext);
  if (context === undefined) {
    throw new Error('useTransition must be used within a TransitionProvider');
  }
  return context;
};