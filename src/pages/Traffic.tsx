
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Calendar, Users, Paperclip } from 'lucide-react';
import { useTrafficData } from '@/hooks/useTrafficData';
import { FilePreview } from '@/components/FilePreview';

export default function Traffic() {
  const { 
    data,
    addData,
    updateData,
    deleteData,
    duplicateMonth,
    getClients,
    getMonths
  } = useTrafficData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [newItem, setNewItem] = useState({
    cliente: '',
    mes: '',
    status: 'Planejamento',
    observacoes: '',
    attachments: [] as File[]
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewItem(prev => ({ 
        ...prev, 
        attachments: [...prev.attachments, ...files]
      }));
    }
  };

  const removeFile = (index: number) => {
    setNewItem(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const serializeFiles = async (files: File[]) => {
    const serializedFiles = [];
    
    for (const file of files) {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      serializedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        data: dataUrl
      });
    }
    
    return serializedFiles;
  };

  const handleAddItem = async () => {
    if (newItem.cliente.trim() && newItem.mes.trim()) {
      const serializedAttachments = await serializeFiles(newItem.attachments);
      
      addData({
        cliente: newItem.cliente,
        mes: newItem.mes,
        status: newItem.status,
        observacoes: newItem.observacoes,
        attachments: serializedAttachments
      });
      
      setNewItem({
        cliente: '',
        mes: '',
        status: 'Planejamento',
        observacoes: '',
        attachments: []
      });
      setIsAddModalOpen(false);
    }
  };

  const handleEditItem = async (item: any) => {
    if (editingItem) {
      const serializedAttachments = await serializeFiles(newItem.attachments);
      
      updateData(item.id, {
        ...newItem,
        attachments: [...(item.attachments || []), ...serializedAttachments]
      });
      
      setEditingItem(null);
      setNewItem({
        cliente: '',
        mes: '',
        status: 'Planejamento',
        observacoes: '',
        attachments: []
      });
    }
  };

  const startEditing = (item: any) => {
    setEditingItem(item);
    setNewItem({
      cliente: item.cliente,
      mes: item.mes,
      status: item.status,
      observacoes: item.observacoes || '',
      attachments: []
    });
  };

  const handleDuplicateMonth = () => {
    if (selectedMonth) {
      duplicateMonth(selectedMonth);
      setSelectedMonth('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planejamento': return 'bg-blue-100 text-blue-800';
      case 'Em Andamento': return 'bg-yellow-100 text-yellow-800';
      case 'Revisão': return 'bg-orange-100 text-orange-800';
      case 'Aprovado': return 'bg-green-100 text-green-800';
      case 'Pausado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = ['Planejamento', 'Em Andamento', 'Revisão', 'Aprovado', 'Pausado'];
  const clients = getClients();
  const months = getMonths();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tráfego Pago</h1>
          <p className="text-gray-600 mt-1">Gerencie campanhas de tráfego pago</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecionar mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleDuplicateMonth}
              disabled={!selectedMonth}
              variant="outline"
              size="sm"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Duplicar
            </Button>
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Item de Tráfego</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cliente">Cliente</Label>
                    <Input
                      id="cliente"
                      value={newItem.cliente}
                      onChange={(e) => setNewItem(prev => ({ ...prev, cliente: e.target.value }))}
                      placeholder="Nome do cliente"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="mes">Mês</Label>
                    <Input
                      id="mes"
                      value={newItem.mes}
                      onChange={(e) => setNewItem(prev => ({ ...prev, mes: e.target.value }))}
                      placeholder="Ex: Janeiro 2024"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newItem.status} onValueChange={(value) => setNewItem(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={newItem.observacoes}
                    onChange={(e) => setNewItem(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações sobre a campanha"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="attachments">Anexos</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="w-full"
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Anexar Arquivos
                    </Button>
                    
                    {newItem.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {newItem.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddItem}>
                    Criar Item
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {data.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{item.cliente}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{item.mes}</p>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteData(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge className={getStatusColor(item.status)} variant="secondary">
                {item.status}
              </Badge>
              
              {item.observacoes && (
                <p className="text-sm text-gray-600">{item.observacoes}</p>
              )}
              
              {item.attachments && item.attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Anexos:</p>
                  <div className="space-y-1">
                    {item.attachments.map((file: any, index: number) => (
                      <FilePreview
                        key={index}
                        file={file}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {data.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item encontrado</h3>
            <p className="text-gray-600 mb-4">Comece criando seu primeiro item de tráfego pago.</p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Item
            </Button>
          </div>
        )}
      </div>

      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-cliente">Cliente</Label>
                  <Input
                    id="edit-cliente"
                    value={newItem.cliente}
                    onChange={(e) => setNewItem(prev => ({ ...prev, cliente: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-mes">Mês</Label>
                  <Input
                    id="edit-mes"
                    value={newItem.mes}
                    onChange={(e) => setNewItem(prev => ({ ...prev, mes: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={newItem.status} onValueChange={(value) => setNewItem(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-observacoes">Observações</Label>
                <Textarea
                  id="edit-observacoes"
                  value={newItem.observacoes}
                  onChange={(e) => setNewItem(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => handleEditItem(editingItem)}>
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
