
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CustomStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStatus: (status: { id: string; name: string; color: string }) => void;
  onAddColumn: (columnName: string) => void;
}

const colorOptions = [
  { name: 'Vermelho', value: 'bg-red-500' },
  { name: 'Verde', value: 'bg-green-500' },
  { name: 'Azul', value: 'bg-blue-500' },
  { name: 'Amarelo', value: 'bg-yellow-500' },
  { name: 'Roxo', value: 'bg-purple-500' },
  { name: 'Rosa', value: 'bg-pink-500' },
  { name: 'Laranja', value: 'bg-orange-500' },
  { name: 'Cinza', value: 'bg-gray-500' },
  { name: 'Verde Claro', value: 'bg-green-300' },
  { name: 'Vinho', value: 'bg-red-800' },
];

export function CustomStatusModal({ open, onOpenChange, onAddStatus, onAddColumn }: CustomStatusModalProps) {
  const [statusName, setStatusName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [columnName, setColumnName] = useState('');

  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (statusName.trim()) {
      onAddStatus({
        id: statusName.toLowerCase().replace(/\s+/g, '-'),
        name: statusName,
        color: selectedColor
      });
      setStatusName('');
      setSelectedColor('bg-blue-500');
    }
  };

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (columnName.trim()) {
      onAddColumn(columnName);
      setColumnName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar Sistema</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="status" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status">Novo Status</TabsTrigger>
            <TabsTrigger value="column">Nova Coluna</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status">
            <form onSubmit={handleAddStatus} className="space-y-4">
              <div>
                <Label htmlFor="statusName">Nome do Status</Label>
                <Input
                  id="statusName"
                  value={statusName}
                  onChange={(e) => setStatusName(e.target.value)}
                  placeholder="Ex: Em Revisão"
                  required
                />
              </div>
              
              <div>
                <Label>Cor do Status</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full ${color.value} ${
                        selectedColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                      onClick={() => setSelectedColor(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                Criar Status
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="column">
            <form onSubmit={handleAddColumn} className="space-y-4">
              <div>
                <Label htmlFor="columnName">Nome da Coluna</Label>
                <Input
                  id="columnName"
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value)}
                  placeholder="Ex: Vídeos, Stories"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                Criar Coluna
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
