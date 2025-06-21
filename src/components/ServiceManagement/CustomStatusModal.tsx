
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit } from 'lucide-react';

interface CustomStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStatus: (status: { id: string; name: string; color: string }) => void;
  onUpdateStatus?: (statusId: string, updates: { name: string; color: string }) => void;
  onDeleteStatus?: (statusId: string) => void;
  existingStatuses?: Array<{ id: string; name: string; color: string }>;
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

export function CustomStatusModal({ 
  open, 
  onOpenChange, 
  onAddStatus, 
  onUpdateStatus,
  onDeleteStatus,
  existingStatuses = []
}: CustomStatusModalProps) {
  const [statusName, setStatusName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('bg-blue-500');

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

  const handleEditStatus = (status: { id: string; name: string; color: string }) => {
    setEditingStatus(status.id);
    setEditName(status.name);
    setEditColor(status.color);
  };

  const handleUpdateStatus = () => {
    if (editingStatus && onUpdateStatus && editName.trim()) {
      onUpdateStatus(editingStatus, {
        name: editName,
        color: editColor
      });
      setEditingStatus(null);
      setEditName('');
      setEditColor('bg-blue-500');
    }
  };

  const handleDeleteStatus = (statusId: string) => {
    if (onDeleteStatus) {
      onDeleteStatus(statusId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Status</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Criar novo status */}
          <div>
            <h3 className="text-lg font-medium mb-4">Criar Novo Status</h3>
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
          </div>

          {/* Lista de status existentes */}
          {existingStatuses.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Status Existentes</h3>
              <div className="space-y-2">
                {existingStatuses.map((status) => (
                  <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                    {editingStatus === status.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1"
                        />
                        <div className="flex gap-1">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={`w-6 h-6 rounded-full ${color.value} ${
                                editColor === color.value ? 'ring-2 ring-offset-1 ring-gray-400' : ''
                              }`}
                              onClick={() => setEditColor(color.value)}
                              title={color.name}
                            />
                          ))}
                        </div>
                        <Button size="sm" onClick={handleUpdateStatus}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingStatus(null)}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${status.color}`} />
                          <span className="font-medium">{status.name}</span>
                        </div>
                        <div className="flex gap-1">
                          {onUpdateStatus && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditStatus(status)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDeleteStatus && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteStatus(status.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
