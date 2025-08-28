
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Copy, ChevronDown } from 'lucide-react';
import { ContentGroup } from '@/hooks/useContentData';

interface DuplicateMonthDialogProps {
  groups: ContentGroup[];
  onDuplicateMonth: (groupId: string, newMonthName: string) => void;
}

export function DuplicateMonthDialog({ groups, onDuplicateMonth }: DuplicateMonthDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [newMonthName, setNewMonthName] = useState('');

  const handleDuplicate = async () => {
    if (!newMonthName.trim() || !selectedGroupId) return;
    
    try {
      await onDuplicateMonth(selectedGroupId, newMonthName);
      setNewMonthName('');
      setSelectedGroupId('');
      setOpen(false);
    } catch (error) {
      console.error('Erro ao duplicar mês:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Duplicar Mês
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {groups.map((group) => (
            <DropdownMenuItem
              key={group.id}
              onClick={() => {
                setSelectedGroupId(group.id);
                setOpen(true);
              }}
            >
              Duplicar {group.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Copy className="h-5 w-5" />
            <span>Duplicar Mês</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Novo Mês</label>
            <Input
              placeholder="Nome para o mês duplicado..."
              value={newMonthName}
              onChange={(e) => setNewMonthName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDuplicate()}
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleDuplicate} className="flex-1">
              Duplicar
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
