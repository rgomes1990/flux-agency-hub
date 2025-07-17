import { useState, useCallback } from 'react';

interface UndoAction {
  id: string;
  description: string;
  action: () => void;
  timestamp: Date;
}

export function useUndoHistory() {
  const [undoHistory, setUndoHistory] = useState<UndoAction[]>([]);

  const addUndoAction = useCallback((description: string, undoAction: () => void) => {
    const action: UndoAction = {
      id: Date.now().toString(),
      description,
      action: undoAction,
      timestamp: new Date()
    };

    setUndoHistory(prev => [action, ...prev.slice(0, 9)]); // Keep only last 10 actions
  }, []);

  const undoLastAction = useCallback(() => {
    if (undoHistory.length > 0) {
      const lastAction = undoHistory[0];
      lastAction.action();
      setUndoHistory(prev => prev.slice(1));
      return lastAction.description;
    }
    return null;
  }, [undoHistory]);

  const clearHistory = useCallback(() => {
    setUndoHistory([]);
  }, []);

  return {
    undoHistory,
    addUndoAction,
    undoLastAction,
    clearHistory,
    hasUndo: undoHistory.length > 0
  };
}