
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar } from 'lucide-react';

interface CreateMonthDialogProps {
  onCreateMonth: (monthName: string) => void;
  trigger?: React.ReactNode;
}

export function CreateMonthDialog({ onCreateMonth, trigger }: CreateMonthDialogProps) {
  const [open, setOpen] = useState(false);
  const [monthName, setMonthName] = useState('');

  const handleCreate = () => {
    if (!monthName.trim()) return;
    
    onCreateMonth(monthName);
    setMonthName('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Mês
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Criar Novo Mês</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Mês</label>
            <Input
              placeholder="Ex: Janeiro, Fevereiro..."
              value={monthName}
              onChange={(e) => setMonthName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleCreate} className="flex-1">
              Criar Mês
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
