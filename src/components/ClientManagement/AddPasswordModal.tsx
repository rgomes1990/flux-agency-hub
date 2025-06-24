
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: { cliente: string; plataforma: string }) => void;
}

export function AddPasswordModal({ open, onOpenChange, onAdd }: AddPasswordModalProps) {
  const [cliente, setCliente] = useState('');
  const [plataforma, setPlataforma] = useState('');

  const handleSubmit = () => {
    if (cliente.trim() && plataforma.trim()) {
      onAdd({ cliente, plataforma });
      setCliente('');
      setPlataforma('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Nova Senha</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="cliente">Cliente</Label>
            <Input
              id="cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nome do cliente"
            />
          </div>
          <div>
            <Label htmlFor="plataforma">Plataforma</Label>
            <Input
              id="plataforma"
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value)}
              placeholder="Nome da plataforma"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleSubmit} className="flex-1">
              Adicionar
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
