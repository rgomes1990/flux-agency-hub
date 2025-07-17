import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Paperclip, Eye } from 'lucide-react';

interface ObservationItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ClientDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  observations: ObservationItem[];
  onUpdateObservations: (observations: ObservationItem[]) => void;
  clientFile?: File | { name: string; data: string; type: string; size: number } | null;
  onFileChange: (file: File | null) => void;
  onFilePreview: (file: File) => void;
  availableGroups: Array<{ id: string; name: string }>;
  currentGroupId: string;
  onMoveClient: (newGroupId: string) => void;
}

export function ClientDetails({
  open,
  onOpenChange,
  clientName,
  observations,
  onUpdateObservations,
  clientFile,
  onFileChange,
  onFilePreview,
  availableGroups,
  currentGroupId,
  onMoveClient
}: ClientDetailsProps) {
  const [newObservationText, setNewObservationText] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(currentGroupId);

  const addObservation = () => {
    if (newObservationText.trim()) {
      const newObservation: ObservationItem = {
        id: Date.now().toString(),
        text: newObservationText.trim(),
        completed: false
      };
      onUpdateObservations([...observations, newObservation]);
      setNewObservationText('');
    }
  };

  const toggleObservation = (id: string) => {
    const updatedObservations = observations.map(obs =>
      obs.id === id ? { ...obs, completed: !obs.completed } : obs
    );
    onUpdateObservations(updatedObservations);
  };

  const deleteObservation = (id: string) => {
    const updatedObservations = observations.filter(obs => obs.id !== id);
    onUpdateObservations(updatedObservations);
  };

  const handleMoveClient = () => {
    if (selectedGroupId !== currentGroupId) {
      onMoveClient(selectedGroupId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente: {clientName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Mover Cliente */}
          <div>
            <h3 className="text-lg font-medium mb-3">Mover Cliente</h3>
            <div className="flex gap-2">
              <select 
                className="flex-1 p-2 border rounded-md text-sm"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
              >
                {availableGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name.replace(' - SITES', '')}
                  </option>
                ))}
              </select>
              <Button 
                onClick={handleMoveClient}
                disabled={selectedGroupId === currentGroupId}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Mover
              </Button>
            </div>
          </div>

          {/* Anexo */}
          <div>
            <h3 className="text-lg font-medium mb-3">Anexo</h3>
            <div className="space-y-2">
              <input
                type="file"
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {clientFile && (
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <Paperclip className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{clientFile.name}</span>
                  {clientFile instanceof File && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onFilePreview(clientFile)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div>
            <h3 className="text-lg font-medium mb-3">Quadros de Observação</h3>
            
            {/* Adicionar nova observação */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Digite uma nova observação..."
                value={newObservationText}
                onChange={(e) => setNewObservationText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addObservation()}
              />
              <Button onClick={addObservation} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Lista de observações */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {observations.map((observation) => (
                <div key={observation.id} className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50">
                  <Checkbox
                    checked={observation.completed}
                    onCheckedChange={() => toggleObservation(observation.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <span 
                      className={`text-sm ${
                        observation.completed 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-900'
                      }`}
                    >
                      {observation.text}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteObservation(observation.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {observations.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  Nenhuma observação adicionada ainda.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}