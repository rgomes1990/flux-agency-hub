
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  FileText, 
  Paperclip, 
  Plus, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  Move, 
  Save,
  Eye
} from 'lucide-react';
import { ClientAttachments } from './ClientAttachments';
import { AttachmentViewer } from '@/components/AttachmentViewer';
import { FormattedObservation } from './FormattedObservation';

interface Observation {
  id: string;
  text: string;
  completed: boolean;
}

interface ClientDetailsModalProps {
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

export function ClientDetailsModal({
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
}: ClientDetailsModalProps) {
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

  const completedCount = observations.filter(obs => obs.completed).length;
  const totalCount = observations.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    {clientName}
                  </DialogTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Detalhes e observações do cliente
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{totalCount}</div>
                  <div className="text-xs text-gray-500">Observações</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{completedCount}</div>
                  <div className="text-xs text-gray-500">Concluídas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{clientAttachments?.length || 0}</div>
                  <div className="text-xs text-gray-500">Anexos</div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="observations" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="observations" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Observações</span>
                  {totalCount > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {completedCount}/{totalCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="attachments" className="flex items-center space-x-2">
                  <Paperclip className="h-4 w-4" />
                  <span>Anexos</span>
                  {clientAttachments && clientAttachments.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {clientAttachments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Move className="h-4 w-4" />
                  <span>Configurações</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-auto">
                <TabsContent value="observations" className="mt-0 space-y-4">
                  {/* Progress Bar */}
                  {totalCount > 0 && (
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progresso</span>
                          <span className="text-sm text-gray-500">{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Add New Observation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Plus className="h-5 w-5 text-blue-600" />
                        <span>Nova Observação</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        placeholder="Descreva a observação ou tarefa..."
                        value={newObservation}
                        onChange={(e) => setNewObservation(e.target.value)}
                        className="min-h-[80px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            addObservation();
                          }
                        }}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Pressione Ctrl+Enter para adicionar
                        </span>
                        <Button 
                          onClick={addObservation}
                          disabled={!newObservation.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Observations List */}
                  <div className="space-y-3">
                    {observations.map((obs) => (
                      <Card key={obs.id} className={`transition-all duration-200 ${obs.completed ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}>
                        <CardContent className="pt-4">
                          {editingObservation === obs.id ? (
                            <div className="space-y-3">
                              <Textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="min-h-[60px] resize-none"
                              />
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => saveObservationEdit(obs.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="h-4 w-4 mr-1" />
                                  Salvar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelObservationEdit}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleObservation(obs.id)}
                                  className={`p-1 rounded-full ${obs.completed ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'}`}
                                >
                                  <Check className={`h-4 w-4 ${obs.completed ? 'opacity-100' : 'opacity-0'}`} />
                                </Button>
                                <div className="flex-1 min-w-0">
                                  <FormattedObservation 
                                    text={obs.text} 
                                    completed={obs.completed}
                                    className="cursor-pointer"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 ml-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditingObservation(obs.id, obs.text)}
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeObservation(obs.id)}
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {observations.length === 0 && (
                    <Card className="border-dashed border-2 border-gray-300">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">
                          Nenhuma observação
                        </h3>
                        <p className="text-gray-500 text-center">
                          Adicione observações para acompanhar o progresso do cliente
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="attachments" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Paperclip className="h-5 w-5 text-blue-600" />
                        <span>Anexos do Cliente</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {clientAttachments !== undefined ? (
                        <ClientAttachments
                          attachments={clientAttachments}
                          onUpdateAttachments={onUpdateAttachments}
                          onFileChange={onFileChange}
                        />
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Funcionalidade de anexos não disponível</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Move className="h-5 w-5 text-blue-600" />
                        <span>Mover Cliente</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Mover para outro mês
                        </label>
                        <Select value={currentGroupId} onValueChange={onMoveClient}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o mês de destino" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableGroups.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name}
                                {group.id === currentGroupId && (
                                  <Badge variant="outline" className="ml-2">Atual</Badge>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <AttachmentViewer
        attachment={selectedAttachment}
        open={showViewer}
        onOpenChange={setShowViewer}
      />
    </>
  );
}
