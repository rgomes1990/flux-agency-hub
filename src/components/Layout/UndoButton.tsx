import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import { useUndo } from '@/contexts/UndoContext';
import { useToast } from '@/hooks/use-toast';

export function UndoButton() {
  const { undoLastAction, hasUndo } = useUndo();
  const { toast } = useToast();

  const handleUndo = () => {
    const description = undoLastAction();
    if (description) {
      toast({
        title: "Ação desfeita",
        description: `Desfez: ${description}`,
      });
    }
  };

  // Always show button for debugging
  console.log('UndoButton render:', { hasUndo, undoCount: hasUndo });

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleUndo}
      className="flex items-center gap-2"
    >
      <Undo2 className="h-4 w-4" />
      Desfazer
    </Button>
  );
}