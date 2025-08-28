
import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import { useUndo } from '@/contexts/UndoContext';
import { useToast } from '@/hooks/use-toast';

export function UndoButton() {
  const { undoLastAction, hasUndo } = useUndo();
  const { toast } = useToast();

  const handleUndo = () => {
    const undoDescription = undoLastAction();
    if (undoDescription) {
      toast({
        title: "Ação desfeita",
        description: undoDescription,
        duration: 3000,
      });
    }
  };

  if (!hasUndo) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleUndo}
      className="flex items-center space-x-2 bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300"
    >
      <Undo2 className="h-4 w-4" />
      <span className="hidden sm:inline">Desfazer</span>
    </Button>
  );
}
