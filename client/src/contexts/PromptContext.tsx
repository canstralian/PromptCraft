import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PromptWithDetails } from '@shared/schema';

interface PromptContextType {
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  selectedPrompt: PromptWithDetails | null;
  setSelectedPrompt: (prompt: PromptWithDetails | null) => void;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export const usePrompt = (): PromptContextType => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePrompt must be used within a PromptProvider');
  }
  return context;
};

interface PromptProviderProps {
  children: ReactNode;
}

export const PromptProvider: React.FC<PromptProviderProps> = ({ children }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptWithDetails | null>(null);

  return (
    <PromptContext.Provider
      value={{
        isModalOpen,
        setModalOpen,
        selectedPrompt,
        setSelectedPrompt,
      }}
    >
      {children}
    </PromptContext.Provider>
  );
};
