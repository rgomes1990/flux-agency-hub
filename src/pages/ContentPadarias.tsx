import React, { useState } from 'react';
import { Plus, Copy, Columns, Palette, Eye, Edit, Trash2, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUndo } from '@/contexts/UndoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useContentPadariasData } from '@/hooks/useContentPadariasData';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { StatusButton } from '@/components/ServiceManagement/StatusButton';
import { CustomStatusModal } from '@/components/ServiceManagement/CustomStatusModal';
import { FilePreview } from '@/components/FilePreview';
import { ClientDetails } from '@/components/ClientManagement/ClientDetails';

export default function ContentPadarias() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newMonthName, setNewMonthName] = useState('');
  const [duplicateMonthName, setDuplicateMonthName] = useState('');
  const [selectedMonthForDuplicate, setSelectedMonthForDuplicate] = useState('');
  const [newClientElement, setNewClientElement] = useState('');
  const [newClientObs, setNewClientObs] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<'status' | 'text'>('status');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [isEditingMonth, setIsEditingMonth] = useState(false);
  const [editingMonthId, setEditingMonthId] = useState('');
  const [editingMonthName, setEditingMonthName] = useState('');
  const [showDeleteMonthConfirm, setShowDeleteMonthConfirm] = useState(false);
  const [monthToDelete, setMonthToDelete] = useState('');
  const [showDeleteClientConfirm, setShowDeleteClientConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState('');
  const [showDeleteColumnConfirm, setShowDeleteColumnConfirm] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState('');
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string } | null>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');

  const isMobile = useIsMobile();
  const { addUndoAction } = useUndo();

  const {
    groups,
    columns,
    customColumns,
    statuses,
    createMonth,
    duplicateMonth,
    addClient,
    addColumn,
    addStatus,
    updateStatus,
    deleteStatus,
    updateColumn,
    deleteColumn,
    updateItemStatus,
    deleteClient,
    updateClient,
    getClientFiles,
    updateMonth,
    deleteMonth,
    isLoading
  } = useContentPadariasData();

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    const allItemIds = groups.flatMap(group => group.items.map(item => item.id));
    if (selectedItems.length === allItemIds.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allItemIds);
    }
  };

  const handleCreateMonth = () => {
    if (newMonthName.trim()) {
      addUndoAction('Criar mês', () => {}); // Add proper undo action if needed
      createMonth(newMonthName.trim());
      setNewMonthName('');
      setShowCreateDialog(false);
      toast.success('Mês criado com sucesso!');
    }
  };

  const handleDuplicateMonth = () => {
    if (duplicateMonthName.trim() && selectedMonthForDuplicate) {
      addUndoAction('Duplicar mês', () => {}); // Add proper undo action if needed
      duplicateMonth(selectedMonthForDuplicate, duplicateMonthName.trim());
      setDuplicateMonthName('');
      setSelectedMonthForDuplicate('');
      setShowDuplicateDialog(false);
      toast.success('Mês duplicado com sucesso!');
    }
  };

  const handleAddClient = () => {
    if (newClientElement.trim() && selectedGroupId) {
      addUndoAction('Adicionar cliente', () => {}); // Add proper undo action if needed
      const clientData = {
        elemento: newClientElement.trim(),
        observacoes: newClientObs.trim() || undefined
      };
      addClient(selectedGroupId, clientData);
      setNewClientElement('');
      setNewClientObs('');
      setShowAddClientDialog(false);
      toast.success('Cliente adicionado com sucesso!');
    }
  };

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      addUndoAction('Adicionar coluna', () => {}); // Add proper undo action if needed
      addColumn(newColumnName.trim(), newColumnType);
      setNewColumnName('');
      setNewColumnType('status');
      setShowColumnsDialog(false);
      toast.success('Coluna adicionada com sucesso!');
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    setColumnToDelete(columnId);
    setShowDeleteColumnConfirm(true);
  };

  const confirmDeleteColumn = () => {
    if (columnToDelete) {
      addUndoAction('Remover coluna', () => {}); // Add proper undo action if needed
      deleteColumn(columnToDelete);
      setColumnToDelete('');
      setShowDeleteColumnConfirm(false);
      toast.success('Coluna removida com sucesso!');
    }
  };

  const handleEditMonth = (monthId: string, currentName: string) => {
    setEditingMonthId(monthId);
    setEditingMonthName(currentName);
    setIsEditingMonth(true);
  };

  const handleSaveMonthEdit = () => {
    if (editingMonthName.trim()) {
      addUndoAction('Editar mês', () => {}); // Add proper undo action if needed
      updateMonth(editingMonthId, editingMonthName.trim());
      setIsEditingMonth(false);
      setEditingMonthId('');
      setEditingMonthName('');
      toast.success('Mês atualizado com sucesso!');
    }
  };

  const handleDeleteMonth = (monthId: string) => {
    setMonthToDelete(monthId);
    setShowDeleteMonthConfirm(true);
  };

  const confirmDeleteMonth = () => {
    if (monthToDelete) {
      addUndoAction('Excluir mês', () => {}); // Add proper undo action if needed
      deleteMonth(monthToDelete);
      setMonthToDelete('');
      setShowDeleteMonthConfirm(false);
      toast.success('Mês excluído com sucesso!');
    }
  };

  const handleDeleteClient = (clientId: string) => {
    setClientToDelete(clientId);
    setShowDeleteClientConfirm(true);
  };

  const confirmDeleteClient = () => {
    if (clientToDelete) {
      addUndoAction('Excluir cliente', () => {}); // Add proper undo action if needed
      deleteClient(clientToDelete);
      setClientToDelete('');
      setShowDeleteClientConfirm(false);
      toast.success('Cliente excluído com sucesso!');
    }
  };

  const handleViewClientDetails = (clientId: string) => {
    setSelectedClientId(clientId);
    setShowClientDetails(true);
  };

  const handleFileClick = async (fileName: string, clientId: string) => {
    try {
      const files = await getClientFiles(clientId);
      const file = files.find(f => f.name === fileName);
      if (file) {
        setPreviewFile(file);
        setShowFilePreview(true);
      }
    } catch (error) {
      toast.error('Erro ao carregar arquivo');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Conteúdo Padarias
          </h1>
          <p className="text-gray-600 mt-1">Gerencie o conteúdo das padarias</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex flex-wrap gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Criar Mês
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Mês</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome do mês"
                  value={newMonthName}
                  onChange={(e) => setNewMonthName(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateMonth}>
                    Criar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Duplicar Mês
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Duplicar Mês</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Selecionar mês para duplicar:</label>
                  <select 
                    value={selectedMonthForDuplicate} 
                    onChange={(e) => setSelectedMonthForDuplicate(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">Selecione um mês</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
                <Input
                  placeholder="Nome do novo mês"
                  value={duplicateMonthName}
                  onChange={(e) => setDuplicateMonthName(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleDuplicateMonth}>
                    Duplicar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Selecionar mês:</label>
                  <select 
                    value={selectedGroupId} 
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">Selecione um mês</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
                <Input
                  placeholder="Elemento"
                  value={newClientElement}
                  onChange={(e) => setNewClientElement(e.target.value)}
                />
                <Textarea
                  placeholder="Observações (opcional)"
                  value={newClientObs}
                  onChange={(e) => setNewClientObs(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddClientDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddClient}>
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showColumnsDialog} onOpenChange={setShowColumnsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns className="h-4 w-4 mr-2" />
                Gerenciar Colunas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gerenciar Colunas</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Colunas Existentes:</h3>
                  {customColumns.map(column => (
                    <div key={column.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{column.name} ({column.type})</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteColumn(column.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Adicionar Nova Coluna:</h3>
                  <div className="space-y-2">
                    <Input
                      placeholder="Nome da coluna"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                    />
                    <select 
                      value={newColumnType} 
                      onChange={(e) => setNewColumnType(e.target.value as 'status' | 'text')}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="status">Status</option>
                      <option value="text">Texto</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowColumnsDialog(false)}>
                    Fechar
                  </Button>
                  <Button onClick={handleAddColumn}>
                    Adicionar Coluna
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={() => setShowStatusDialog(true)}>
            <Palette className="h-4 w-4 mr-2" />
            Gerenciar Status
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left p-4">
                  <Checkbox
                    checked={selectedItems.length === groups.flatMap(g => g.items).length && groups.flatMap(g => g.items).length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-4 font-medium">Mês</th>
                <th className="text-left p-4 font-medium">Elemento</th>
                <th className="text-left p-4 font-medium">Observações</th>
                {customColumns.map(column => (
                  <th key={column.id} className="text-left p-4 font-medium">{column.name}</th>
                ))}
                <th className="text-left p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(group => (
                <React.Fragment key={group.id}>
                  <tr className="border-b bg-blue-50 hover:bg-blue-100">
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroupExpansion(group.id)}
                      >
                        {expandedGroups.includes(group.id) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </Button>
                    </td>
                    <td className="p-4">
                      {isEditingMonth && editingMonthId === group.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editingMonthName}
                            onChange={(e) => setEditingMonthName(e.target.value)}
                            className="max-w-xs"
                          />
                          <Button size="sm" onClick={handleSaveMonthEdit}>
                            Salvar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setIsEditingMonth(false)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{group.name}</span>
                          <Badge variant="secondary">{group.items.length}</Badge>
                        </div>
                      )}
                    </td>
                    <td className="p-4"></td>
                    <td className="p-4"></td>
                    {customColumns.map(column => (
                      <td key={column.id} className="p-4"></td>
                    ))}
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMonth(group.id, group.name)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMonth(group.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedGroups.includes(group.id) && group.items.map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                        />
                      </td>
                      <td className="p-4"></td>
                      <td className="p-4">{item.elemento}</td>
                      <td className="p-4 max-w-xs truncate" title={item.observacoes}>
                        {item.observacoes}
                      </td>
                      {customColumns.map(column => (
                        <td key={column.id} className="p-4">
                          {column.type === 'status' ? (
                            <StatusButton
                              currentStatus={item[column.name as keyof typeof item] as string}
                              onStatusChange={(statusId) => updateItemStatus(item.id, column.name, statusId)}
                              statuses={statuses}
                            />
                          ) : (
                            <Input
                              value={item[column.name as keyof typeof item] as string || ''}
                              onChange={(e) => updateClient(item.id, { [column.name]: e.target.value })}
                              className="max-w-xs"
                            />
                          )}
                        </td>
                      ))}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewClientDetails(item.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClient(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CustomStatusModal
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        onAddStatus={addStatus}
        onUpdateStatus={updateStatus}
        onDeleteStatus={deleteStatus}
        existingStatuses={statuses}
      />

      <FilePreview
        open={showFilePreview}
        onOpenChange={setShowFilePreview}
        file={previewFile ? new File([], previewFile.name) : null}
      />

      <ClientDetails
        open={showClientDetails}
        onOpenChange={setShowClientDetails}
        clientName={groups.flatMap(g => g.items).find(item => item.id === selectedClientId)?.elemento || ''}
        observations={[]}
        onUpdateObservations={() => {}}
        clientFile={null}
        onFileChange={() => {}}
        onFilePreview={() => {}}
        availableGroups={groups.map(g => ({ id: g.id, name: g.name }))}
        currentGroupId={groups.find(g => g.items.some(item => item.id === selectedClientId))?.id || ''}
        onMoveClient={() => {}}
      />

      <AlertDialog open={showDeleteMonthConfirm} onOpenChange={setShowDeleteMonthConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este mês? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMonth}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteClientConfirm} onOpenChange={setShowDeleteClientConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteClient}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteColumnConfirm} onOpenChange={setShowDeleteColumnConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta coluna? Esta ação removerá a coluna de todos os itens e não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteColumn}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
