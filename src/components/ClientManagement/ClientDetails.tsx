import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Move, Paperclip, Eye, Upload, Edit } from 'lucide-react';
import { ClientAttachments } from './ClientAttachments';
import { AttachmentViewer } from '@/components/AttachmentViewer';
import { FormattedObservation } from './FormattedObservation';

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
  const [editingObservation, setEditingObservation] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);
  const [showViewer, setShowViewer] = useState(false);

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

  const startEditingObservation = (id: string, text: string) => {
    setEditingObservation(id);
    setEditingText(text);
  };

  const saveObservationEdit = (id: string) => {
    if (!editingText.trim()) return;
    
    const updated = observations.map(obs => 
      obs.id === id ? { ...obs, text: editingText.trim() } : obs
    );
    onUpdateObservations(updated);
    setEditingObservation(null);
    setEditingText('');
  };

  const cancelObservationEdit = () => {
    setEditingObservation(null);
    setEditingText('');
  };

  const handleViewAttachment = (attachment: any) => {
    setSelectedAttachment(attachment);
    setShowViewer(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Detalhes do Cliente: {clientName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Mover Cliente */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Move className="h-4 w-4 mr-2 text-blue-600" />
                  Mover para outro mês
                </label>
                <Select value={currentGroupId} onValueChange={onMoveClient}>
                  <SelectTrigger className="w-full">
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
            </div>

            {/* Observações */}
            <div className="bg-white border rounded-lg">
              <div className="border-b border-gray-200 px-4 py-3">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Edit className="h-4 w-4 mr-2 text-blue-600" />
                  Observações ({observations.length})
                </h4>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Adicionar Nova Observação */}
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Nova observação..."
                    value={newObservation}
                    onChange={(e) => setNewObservation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && addObservation()}
                    className="flex-1 resize-none"
                    rows={2}
                  />
                  <Button 
                    onClick={addObservation} 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Lista de Observações */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {observations.map((obs) => (
                    <div 
                      key={obs.id} 
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded border hover:bg-gray-100 transition-colors"
                    >
                      <Checkbox
                        checked={obs.completed}
                        onCheckedChange={() => toggleObservation(obs.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        {editingObservation === obs.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full resize-none"
                              rows={2}
                            />
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => saveObservationEdit(obs.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelObservationEdit}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="cursor-pointer hover:text-blue-600"
                            onClick={() => startEditingObservation(obs.id, obs.text)}
                          >
                            <FormattedObservation 
                              text={obs.text} 
                              completed={obs.completed}
                            />
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeObservation(obs.id)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {observations.length === 0 && (
                  <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Edit className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nenhuma observação adicionada</p>
                    <p className="text-xs text-gray-400">Adicione observações para acompanhar o progresso</p>
                  </div>
                )}
              </div>
            </div>

            {/* Anexos - Only show if clientAttachments is not undefined */}
            {clientAttachments !== undefined && (
              <div className="bg-white border rounded-lg">
                <div className="border-b border-gray-200 px-4 py-3">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Paperclip className="h-4 w-4 mr-2 text-blue-600" />
                    Anexos ({clientAttachments.length})
                  </h4>
                </div>
                
                <div className="p-4">
                  <ClientAttachments
                    attachments={clientAttachments}
                    onUpdateAttachments={onUpdateAttachments}
                    onFileChange={onFileChange}
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Attachment Viewer */}
      <AttachmentViewer
        attachment={selectedAttachment}
        open={showViewer}
        onOpenChange={setShowViewer}
      />
    </>
  );
}
