
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { ContentGroup } from '@/hooks/useContentData';

interface CreateClientDialogProps {
  groups: ContentGroup[];
  onAddClient: (groupId: string, client: { elemento: string; servicos: string }) => void;
}

export function CreateClientDialog({ groups, onAddClient }: CreateClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientServices, setClientServices] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const handleCreate = () => {
    if (!clientName.trim() || !selectedGroupId) return;
    
    onAddClient(selectedGroupId, {
      elemento: clientName,
      servicos: clientServices
    });
    
    setClientName('');
    setClientServices('');
    setSelectedGroupId('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Novo Cliente</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Cliente</label>
            <Input
              placeholder="Nome do cliente..."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Serviços</label>
            <Input
              placeholder="Ex: Gestão de Redes Sociais, 16 Conteúdos..."
              value={clientServices}
              onChange={(e) => setClientServices(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mês</label>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um mês" />
              </SelectTrigger>
              <SelectContent>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleCreate} className="flex-1">
              Criar Cliente
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
