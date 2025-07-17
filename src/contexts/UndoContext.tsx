import React, { createContext, useContext } from 'react';
import { useUndoHistory } from '@/hooks/useUndoHistory';

interface UndoContextType {
  addUndoAction: (description: string, undoAction: () => void) => void;
  undoLastAction: () => string | null;
  clearHistory: () => void;
  hasUndo: boolean;
}

const UndoContext = createContext<UndoContextType | undefined>(undefined);

export function UndoProvider({ children }: { children: React.ReactNode }) {
  const undoHistory = useUndoHistory();

  return (
    <UndoContext.Provider value={undoHistory}>
      {children}
    </UndoContext.Provider>
  );
}

export function useUndo() {
  const context = useContext(UndoContext);
  if (context === undefined) {
    throw new Error('useUndo must be used within an UndoProvider');
  }
  return context;
}