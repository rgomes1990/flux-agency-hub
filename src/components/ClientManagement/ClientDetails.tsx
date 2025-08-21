
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Move } from 'lucide-react';
import { ClientAttachments } from './ClientAttachments';

interface Observation {
  id: string;
  text: string;
  completed: boolean;
}

interface ClientDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  observations: Observation[];
  onUpdateObservations: (observations: Observation[]) => void;
  clientFile: File | null;
  onFileChange: (file: File | null) => void;
  onFilePreview?: (file: File) => void;
  availableGroups: Array<{ id: string; name: string }>;
  currentGroupId: string;
  onMoveClient: (newGroupId: string) => void;
  clientAttachments: Array<{
    name: string;
    path?: string;
    size?: number;
    type: string;
    data?: string;
  }>;
  onUpdateAttachments: (attachments: any[]) => void;
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
  onMoveClient,
  clientAttachments,
  onUpdateAttachments
}: ClientDetailsProps) {
  const [newObservation, setNewObservation] = useState('');

  const addObservation = () => {
    if (!newObservation.trim()) return;

    const newObs: Observation = {
      id: crypto.randomUUID(),
      text: newObservation.trim(),
      completed: false
    };

    onUpdateObservations([...observations, newObs]);
    setNewObservation('');
  };

  const toggleObservation = (id: string) => {
    const updated = observations.map(obs => 
      obs.id === id ? { ...obs, completed: !obs.completed } : obs
    );
    onUpdateObservations(updated);
  };

  const removeObservation = (id: string) => {
    const updated = observations.filter(obs => obs.id !== id);
    onUpdateObservations(updated);
  };

  const updateObservationText = (id: string, newText: string) => {
    const updated = observations.map(obs => 
      obs.id === id ? { ...obs, text: newText } : obs
    );
    onUpdateObservations(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente: {clientName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mover Cliente */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <Move className="h-4 w-4 mr-2" />
              Mover para outro mês
            </label>
            <Select value={currentGroupId} onValueChange={onMoveClient}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {availableGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h4 className="font-medium">Observações</h4>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Nova observação..."
                value={newObservation}
                onChange={(e) => setNewObservation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addObservation()}
              />
              <Button onClick={addObservation} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {observations.map((obs) => (
                <div key={obs.id} className="flex items-center space-x-2 p-2 border rounded">
                  <Checkbox
                    checked={obs.completed}
                    onCheckedChange={() => toggleObservation(obs.id)}
                  />
                  <Input
                    value={obs.text}
                    onChange={(e) => updateObservationText(obs.id, e.target.value)}
                    className={`flex-1 ${obs.completed ? 'line-through text-gray-500' : ''}`}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeObservation(obs.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {observations.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                Nenhuma observação adicionada
              </p>
            )}
          </div>

          {/* Anexos */}
          <ClientAttachments
            attachments={clientAttachments}
            onUpdateAttachments={onUpdateAttachments}
            onFileChange={onFileChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
