
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (service: any) => void;
  customColumns: string[];
}

export function AddServiceModal({ open, onOpenChange, onAdd, customColumns }: AddServiceModalProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    services: '',
    duration: 0,
    price: 0,
    clientStatus: 'ativo',
    title: '',
    texts: '',
    arts: '',
    posting: '',
    customColumns: {} as { [key: string]: string }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({
      clientName: '',
      services: '',
      duration: 0,
      price: 0,
      clientStatus: 'ativo',
      title: '',
      texts: '',
      arts: '',
      posting: '',
      customColumns: {}
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Serviço</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="services">Serviços</Label>
              <Input
                id="services"
                value={formData.services}
                onChange={(e) => setFormData(prev => ({ ...prev, services: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Duração (horas)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="clientStatus">Status do Cliente</Label>
              <Input
                id="clientStatus"
                value={formData.clientStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, clientStatus: e.target.value }))}
              />
            </div>
          </div>

          {customColumns.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Colunas Personalizadas</h4>
              <div className="grid grid-cols-2 gap-4">
                {customColumns.map(col => (
                  <div key={col}>
                    <Label htmlFor={col}>{col}</Label>
                    <Input
                      id={col}
                      value={formData.customColumns[col] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        customColumns: { ...prev.customColumns, [col]: e.target.value }
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Adicionar Serviço
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
