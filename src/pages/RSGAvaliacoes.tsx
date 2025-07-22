import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Copy,
  Settings,
  Edit,
  Trash2,
  Paperclip,
  Eye,
  Menu,
  RefreshCw
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import useRSGAvaliacoesData, { RSGAvaliacoesGroup, RSGAvaliacoesItem, RSGAvaliacoesColumn, RSGAvaliacoesStatus } from '@/hooks/useRSGAvaliacoesData';
import { StatusButton } from '@/components/ServiceManagement/StatusButton';
import { CustomStatusModal } from '@/components/ServiceManagement/CustomStatusModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { FilePreview } from '@/components/FilePreview';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClientDetails } from '@/components/ClientManagement/ClientDetails';
import { useUndo } from '@/contexts/UndoContext';

export default function RSGAvaliacoes() {
  const isMobile = useIsMobile();
  const {
    groups,
    columns,
    statuses,
    isLoading,
    saveData,
    createColumn,
    deleteColumn,
    createStatus,
    deleteStatus,
    updateGroup,
    createGroup,
    duplicateGroup,
    deleteMonth
  } = useRSGAvaliacoesData();
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [newMonthName, setNewMonthName] = useState('');
  const [duplicateMonthName, setDuplicateMonthName] = useState('');
  const [selectedGroupToDuplicate, setSelectedGroupToDuplicate] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState<string | null>(null);
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientServices, setNewClientServices] = useState('');
  const [selectedGroupForClient, setSelectedGroupForClient] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [clientFile, setClientFile] = useState<File | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<'status' | 'text'>('status');
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'client' | 'column' | 'month', id: string } | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [editingMonth, setEditingMonth] = useState<{ id: string, name: string } | null>(null);
  const [showEditMonthDialog, setShowEditMonthDialog] = useState(false);
  const [showMobileToolbar, setShowMobileToolbar] = useState(false);
  const [clientObservations, setClientObservations] = useState<Array<{id: string, text: string, completed: boolean}>>([]);
  
  const { addUndoAction } = useUndo();

  const toggleGroup = (groupId: string) => {
    updateGroup(groupId, { isExpanded: !groups.find(g => g.id === groupId)?.isExpanded });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = groups.flatMap(group => group.items.map(item => item.id));
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleCreateMonth = async () => {
    if (!newMonthName.trim()) return;
    
    await createGroup(newMonthName, 'bg-purple-500');
    setNewMonthName('');
    setShowCreateDialog(false);
  };

  const handleDuplicateMonth = async () => {
    if (!duplicateMonthName.trim() || !selectedGroupToDuplicate) return;
    
    try {
      await duplicateGroup(selectedGroupToDuplicate, duplicateMonthName);
      setDuplicateMonthName('');
      setSelectedGroupToDuplicate('');
      setShowDuplicateDialog(false);
    } catch (error) {
      console.error('Erro ao duplicar mês:', error);
    }
  };

  const handleCreateClient = () => {
    if (!newClientName.trim() || !selectedGroupForClient) return;
    
    const newClient = {
      id: `rsg-client-${Date.now()}`,
      elemento: newClientName,
      servicos: newClientServices
    };
    
    const updatedGroups = groups.map(group => 
      group.id === selectedGroupForClient 
        ? { ...group, items: [...group.items, newClient] }
        : group
    );
    
    saveData(updatedGroups);
    setNewClientName('');
    setNewClientServices('');
    setSelectedGroupForClient('');
    setShowClientDialog(false);
  };

  const handleCreateColumn = () => {
    if (!newColumnName.trim()) return;
    
    createColumn(newColumnName, newColumnType);
    setNewColumnName('');
    setNewColumnType('status');
    setShowColumnDialog(false);
  };

  const handleDeleteClient = (clientId: string) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== clientId)
    }));
    saveData(updatedGroups);
    setConfirmDelete(null);
  };

  const handleDeleteColumn = (columnId: string) => {
    deleteColumn(columnId);
    setConfirmDelete(null);
  };

  const handleEditMonth = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const nameWithoutSuffix = group.name.replace(' - RSG AVALIAÇÕES', '');
      setEditingMonth({ id: groupId, name: nameWithoutSuffix });
      setShowEditMonthDialog(true);
    }
  };

  const handleUpdateMonth = () => {
    if (editingMonth && editingMonth.name.trim()) {
      updateGroup(editingMonth.id, { name: editingMonth.name + ' - RSG AVALIAÇÕES' });
      setEditingMonth(null);
      setShowEditMonthDialog(false);
    }
  };

  const handleDeleteMonth = (groupId: string) => {
    deleteMonth(groupId);
    setConfirmDelete(null);
  };

  const updateItemStatus = (itemId: string, columnId: string, statusId: string) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId ? { ...item, [columnId]: statusId } : item
      )
    }));
    saveData(updatedGroups);
  };

  const updateClientField = (itemId: string, updates: any) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    }));
    saveData(updatedGroups);
  };

  const getClientFiles = (clientId: string) => {
    const client = groups.flatMap(g => g.items).find(item => item.id === clientId);
    return client?.attachments || [];
  };

  const openClientDetails = (clientId: string) => {
    setShowClientDetails(clientId);
  };

  const saveClientDetails = async () => {
    setShowClientDetails(null);
  };

  const handleMoveClient = (clientId: string, newGroupId: string) => {
    // Move client logic here
  };

  const openFilePreview = (file: File) => {
    setPreviewFile(file);
    setShowFilePreview(true);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900">RSG Avaliações</h1>
            <div className="text-xs text-gray-500">
              Grupos: {groups.length} | Colunas: {columns.length} | Status: {statuses.length}
            </div>
          </div>
          {isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileToolbar(!showMobileToolbar)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className={`bg-white border-b border-gray-200 px-4 py-2 ${isMobile && !showMobileToolbar ? 'hidden' : ''}`}>
        <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex items-center space-x-2'}`}>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className={isMobile ? 'w-full' : ''}>
                <Plus className="h-4 w-4 mr-1" />
                Criar mês
              </Button>
            </DialogTrigger>
            <DialogContent className={isMobile ? 'w-[95vw] max-w-none' : ''}>
              <DialogHeader>
                <DialogTitle>Criar Novo Mês</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome do mês"
                  value={newMonthName}
                  onChange={(e) => setNewMonthName(e.target.value)}
                />
                <div className="flex space-x-2">
                  <Button onClick={handleCreateMonth} className="bg-purple-600 hover:bg-purple-700 flex-1">
                    Criar
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={isMobile ? 'w-full' : ''}>
                <Copy className="h-4 w-4 mr-1" />
                Duplicar mês
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {groups.map((group) => (
                <DropdownMenuItem
                  key={group.id}
                  onClick={() => {
                    setSelectedGroupToDuplicate(group.id);
                    setShowDuplicateDialog(true);
                  }}
                >
                  Duplicar {group.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowClientDialog(true)}
            className={isMobile ? 'w-full' : ''}
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo Cliente
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowColumnDialog(true)}
            className={isMobile ? 'w-full' : ''}
          >
            <Settings className="h-4 w-4 mr-1" />
            Gerenciar Colunas
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowStatusModal(true)}
            className={isMobile ? 'w-full' : ''}
          >
            <Settings className="h-4 w-4 mr-1" />
            Gerenciar Status
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className={`${isMobile ? 'min-w-[800px]' : 'min-w-full'}`}>
          {/* Table Header */}
          <div className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
            <div className="flex items-center min-w-max">
              <div className="w-8 flex items-center justify-center p-2">
                <Checkbox
                  checked={selectedItems.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </div>
              <div className="w-48 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Cliente</div>
              <div className="w-36 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Serviços</div>
              {columns.map((column) => (
                <div key={column.id} className="w-32 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">
                  {column.name}
                </div>
              ))}
              <div className="w-20 p-2 text-xs font-medium text-gray-600">Ações</div>
            </div>
          </div>

          {/* Table Body */}
          {groups.map((group) => (
            <div key={group.id}>
              {/* Group Header */}
              <div className="bg-purple-50 border-b border-gray-200 hover:bg-purple-100 transition-colors">
                <div className="flex items-center min-w-max">
                  <div className="w-8 flex items-center justify-center p-2">
                    <button onClick={() => toggleGroup(group.id)}>
                      {group.isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 p-2 flex-1">
                    <div className={`w-3 h-3 rounded ${group.color}`}></div>
                    <span className="font-medium text-gray-900">{group.name}</span>
                  </div>
                  <div className="flex items-center space-x-1 p-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditMonth(group.id)}
                      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmDelete({ type: 'month', id: group.id })}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Group Items */}
              {group.isExpanded && group.items.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center min-w-max">
                    <div className="w-8 flex items-center justify-center p-2">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                      />
                    </div>
                    <div className="w-48 p-2 border-r border-gray-200">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openClientDetails(item.id)}
                          className="text-sm text-blue-600 hover:underline font-medium text-left"
                        >
                          {item.elemento}
                        </button>
                        {getClientFiles(item.id).length > 0 && (
                          <Paperclip className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="w-36 p-2 text-sm text-gray-600 border-r border-gray-200">
                      {item.servicos}
                    </div>
                    {columns.map((column) => (
                      <div key={column.id} className="w-32 p-2 border-r border-gray-200">
                        {column.type === 'status' ? (
                          <StatusButton
                            currentStatus={(item as any)[column.id] || ''}
                            statuses={statuses}
                            onStatusChange={(statusId) => updateItemStatus(item.id, column.id, statusId)}
                          />
                        ) : (
                          <Input
                            value={(item as any)[column.id] || ''}
                            onChange={(e) => updateClientField(item.id, { [column.id]: e.target.value })}
                            className="border-0 bg-transparent p-0 h-auto"
                            placeholder="..."
                          />
                        )}
                      </div>
                    ))}
                    <div className="w-20 p-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openClientDetails(item.id)}>
                            <Eye className="h-3 w-3 mr-1" />
                            Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setConfirmDelete({ type: 'client', id: item.id })}
                            className="text-red-600"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Dialogs and Modals */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className={isMobile ? 'w-[95vw] max-w-none' : ''}>
          <DialogHeader>
            <DialogTitle>Duplicar Mês</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome do novo mês"
              value={duplicateMonthName}
              onChange={(e) => setDuplicateMonthName(e.target.value)}
            />
            <div className="flex space-x-2">
              <Button onClick={handleDuplicateMonth} className="bg-purple-600 hover:bg-purple-700 flex-1">
                Duplicar
              </Button>
              <Button variant="outline" onClick={() => setShowDuplicateDialog(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent className={isMobile ? 'w-[95vw] max-w-none' : ''}>
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Mês de Destino</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {groups.find(g => g.id === selectedGroupForClient)?.name || 'Selecione um mês'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {groups.map((group) => (
                    <DropdownMenuItem
                      key={group.id}
                      onClick={() => setSelectedGroupForClient(group.id)}
                    >
                      {group.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Input
              placeholder="Nome do cliente"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
            />
            <Textarea
              placeholder="Serviços (opcional)"
              value={newClientServices}
              onChange={(e) => setNewClientServices(e.target.value)}
            />
            <div className="flex space-x-2">
              <Button onClick={handleCreateClient} className="bg-purple-600 hover:bg-purple-700 flex-1">
                Criar
              </Button>
              <Button variant="outline" onClick={() => setShowClientDialog(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
        <DialogContent className={isMobile ? 'w-[95vw] max-w-none' : ''}>
          <DialogHeader>
            <DialogTitle>Gerenciar Colunas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Colunas Existentes</div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {columns.map(column => (
                  <div key={column.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{column.name} ({column.type})</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDelete({ type: 'column', id: column.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="text-sm font-medium mb-2">Nova Coluna</div>
              <Input
                placeholder="Nome da coluna"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="mb-2"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start mb-2">
                    {newColumnType === 'status' ? 'Status' : 'Texto'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setNewColumnType('status')}>
                    Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setNewColumnType('text')}>
                    Texto
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleCreateColumn} className="bg-purple-600 hover:bg-purple-700 flex-1">
                Adicionar
              </Button>
              <Button variant="outline" onClick={() => setShowColumnDialog(false)} className="flex-1">
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditMonthDialog} onOpenChange={setShowEditMonthDialog}>
        <DialogContent className={isMobile ? 'w-[95vw] max-w-none' : ''}>
          <DialogHeader>
            <DialogTitle>Editar Mês</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome do mês"
              value={editingMonth?.name || ''}
              onChange={(e) => setEditingMonth(prev => prev ? { ...prev, name: e.target.value } : null)}
            />
            <div className="flex space-x-2">
              <Button onClick={handleUpdateMonth} className="bg-purple-600 hover:bg-purple-700 flex-1">
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setShowEditMonthDialog(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CustomStatusModal
        open={showStatusModal}
        onOpenChange={setShowStatusModal}
        onAddStatus={(status) => createStatus(status.name, status.color)}
        onDeleteStatus={deleteStatus}
        existingStatuses={statuses}
      />

      {showClientDetails && (
        <ClientDetails
          open={!!showClientDetails}
          onOpenChange={() => setShowClientDetails(null)}
          clientName={groups.flatMap(g => g.items).find(item => item.id === showClientDetails)?.elemento || ''}
          observations={clientObservations}
          onUpdateObservations={setClientObservations}
          onFileChange={setClientFile}
          onFilePreview={openFilePreview}
          availableGroups={groups.map(g => ({ id: g.id, name: g.name }))}
          currentGroupId={groups.find(g => g.items.some(item => item.id === showClientDetails))?.id || ''}
          onMoveClient={(newGroupId) => {
            if (showClientDetails) {
              handleMoveClient(showClientDetails, newGroupId);
            }
          }}
        />
      )}

      <FilePreview
        file={previewFile}
        open={showFilePreview}
        onOpenChange={setShowFilePreview}
      />

      <ConfirmationDialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          
          switch (confirmDelete.type) {
            case 'client':
              handleDeleteClient(confirmDelete.id);
              break;
            case 'column':
              handleDeleteColumn(confirmDelete.id);
              break;
            case 'month':
              handleDeleteMonth(confirmDelete.id);
              break;
          }
        }}
        title={`Confirmar ${confirmDelete?.type === 'client' ? 'exclusão do cliente' : 
               confirmDelete?.type === 'column' ? 'exclusão da coluna' : 
               'exclusão do mês'}`}
        message={`Esta ação não pode ser desfeita. ${
          confirmDelete?.type === 'client' ? 'O cliente será removido permanentemente.' :
          confirmDelete?.type === 'column' ? 'A coluna será removida permanentemente.' :
          'O mês e todos os seus dados serão removidos permanentemente.'
        }`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}