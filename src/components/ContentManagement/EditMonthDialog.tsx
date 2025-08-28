
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit } from 'lucide-react';
import { ContentGroup } from '@/hooks/useContentData';

interface EditMonthDialogProps {
  groups: ContentGroup[];
  onUpdateMonth: (groupId: string, newName: string) => void;
}

export function EditMonthDialog({ groups, onUpdateMonth }: EditMonthDialogProps) {
  const [open, setOpen] = useState(false);
  const [editingMonth, setEditingMonth] = useState<{ id: string, name: string } | null>(null);

  const handleUpdate = () => {
    if (!editingMonth || !editingMonth.name.trim()) return;
    
    onUpdateMonth(editingMonth.id, editingMonth.name);
    setEditingMonth(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Editar Mês</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Mês</label>
            <Input
              placeholder="Nome do mês..."
              value={editingMonth?.name || ''}
              onChange={(e) => setEditingMonth(prev => 
                prev ? { ...prev, name: e.target.value } : null
              )}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleUpdate} className="flex-1">
              Salvar
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
