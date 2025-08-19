import React, { useState } from 'react';
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
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useGoogleMyBusinessData } from '@/hooks/useGoogleMyBusinessData';
import { StatusButton } from '@/components/ServiceManagement/StatusButton';
import { CustomStatusModal } from '@/components/ServiceManagement/CustomStatusModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { FilePreview } from '@/components/FilePreview';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClientDetails } from '@/components/ClientManagement/ClientDetails';
import { useUndo } from '@/contexts/UndoContext';
import { SortableGMBRow } from '@/components/ClientManagement/SortableGMBRow';

export default function GoogleMyBusiness() {
  const isMobile = useIsMobile();
  const { 
    groups, 
    columns,
    customColumns, // Use customColumns for management interface
    statuses,
    defaultObservations,
    updateGroups, 
    createMonth, 
    updateMonth,
    deleteMonth,
    duplicateMonth,
    addStatus,
    updateStatus,
    deleteStatus,
    addColumn,
    updateColumn,
    deleteColumn,
    updateItemStatus,
    addClient,
    deleteClient,
    updateClient,
    getClientFiles,
    addDefaultObservation,
    updateDefaultObservation,
    deleteDefaultObservation,
    createDefaultObservationsFromGrupoForte,
    applyDefaultObservationsToAllClients
  } = useGoogleMyBusinessData();
  
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
  const [showObservationsDialog, setShowObservationsDialog] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientServices, setNewClientServices] = useState('');
  const [selectedGroupForClient, setSelectedGroupForClient] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [clientFile, setClientFile] = useState<File | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<'status' | 'text'>('status');
  const [newObservationText, setNewObservationText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'client' | 'column' | 'month' | 'observation', id: string } | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [editingMonth, setEditingMonth] = useState<{ id: string, name: string } | null>(null);
  const [showEditMonthDialog, setShowEditMonthDialog] = useState(false);
  const [showMobileToolbar, setShowMobileToolbar] = useState(false);
  const [clientObservations, setClientObservations] = useState<Array<{id: string, text: string, completed: boolean}>>([]);
  
  const { addUndoAction } = useUndo();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleGroup = (groupId: string) => {
    updateGroups(groups.map(group => 
      group.id === groupId 
        ? { ...group, isExpanded: !group.isExpanded }
        : group
    ));
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

  const handleCreateMonth = () => {
    if (!newMonthName.trim()) return;
    
    createMonth(newMonthName);
    setNewMonthName('');
    setShowCreateDialog(false);
  };

  const handleDuplicateMonth = async () => {
    if (!duplicateMonthName.trim() || !selectedGroupToDuplicate) return;
    
    try {
      await duplicateMonth(selectedGroupToDuplicate, duplicateMonthName);
      setDuplicateMonthName('');
      setSelectedGroupToDuplicate('');
      setShowDuplicateDialog(false);
    } catch (error) {
      console.error('Erro ao duplicar mês:', error);
    }
  };

  const handleCreateClient = () => {
    if (!newClientName.trim() || !selectedGroupForClient) return;
    
    addClient(selectedGroupForClient, {
      elemento: newClientName,
      servicos: newClientServices
    });
    
    setNewClientName('');
    setNewClientServices('');
    setSelectedGroupForClient('');
    setShowClientDialog(false);
  };

  const handleCreateColumn = () => {
    if (!newColumnName.trim()) return;
    
    addColumn(newColumnName, newColumnType);
    setNewColumnName('');
    setNewColumnType('status');
    setShowColumnDialog(false);
  };

  const handleDeleteClient = (clientId: string) => {
    deleteClient(clientId);
    setConfirmDelete(null);
  };

  const handleDeleteColumn = (columnId: string) => {
    deleteColumn(columnId);
    setConfirmDelete(null);
  };

  const handleEditMonth = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const nameWithoutSuffix = group.name.replace(' - GOOGLE MY BUSINESS', '');
      setEditingMonth({ id: groupId, name: nameWithoutSuffix });
      setShowEditMonthDialog(true);
    }
  };

  const handleUpdateMonth = () => {
    if (editingMonth && editingMonth.name.trim()) {
      updateMonth(editingMonth.id, editingMonth.name);
      setEditingMonth(null);
      setShowEditMonthDialog(false);
    }
  };

  const handleDeleteMonth = (groupId: string) => {
    deleteMonth(groupId);
    setConfirmDelete(null);
  };

  const openClientDetails = (clientId: string) => {
    const client = groups.flatMap(g => g.items).find(item => item.id === clientId);
    if (client) {
      setClientNotes(client.observacoes || '');
      const files = getClientFiles(clientId);
      setClientFile(files[0] || null);
      
      // Parse existing observations from client notes
      try {
        const parsed = JSON.parse(client.observacoes || '[]');
        if (Array.isArray(parsed)) {
          setClientObservations(parsed);
        } else {
          setClientObservations([]);
        }
      } catch {
        setClientObservations([]);
      }
      
      setShowClientDetails(clientId);
    }
  };

  const saveClientDetails = async () => {
    if (showClientDetails) {
      const updates: any = { 
        observacoes: JSON.stringify(clientObservations) 
      };
      
      if (clientFile) {
        updates.attachments = [clientFile];
      }
      
      await updateClient(showClientDetails, updates);
    }
    setShowClientDetails(null);
    setClientObservations([]);
    setClientFile(null);
  };

  const handleMoveClient = (clientId: string, newGroupId: string) => {
    const client = groups.flatMap(g => g.items).find(item => item.id === clientId);
    const oldGroup = groups.find(g => g.items.some(item => item.id === clientId));
    
    if (client && oldGroup) {
      // Remove from old group
      deleteClient(clientId);
      
      // Add to new group
      addClient(newGroupId, {
        elemento: client.elemento,
        servicos: client.servicos || '',
        observacoes: client.observacoes,
        ...client
      });
      
      setShowClientDetails(null);
    }
  };

  const openFilePreview = (file: File) => {
    setPreviewFile(file);
    setShowFilePreview(true);
  };

  const getClientAttachments = (clientId: string) => {
    return getClientFiles(clientId);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Find the source and target groups
    const activeGroupId = active.data.current?.groupId;
    const overGroupId = over.data.current?.groupId;

    if (!activeGroupId) return;

    const newGroups = [...groups];
    const activeGroupIndex = newGroups.findIndex(g => g.id === activeGroupId);
    const overGroupIndex = overGroupId ? newGroups.findIndex(g => g.id === overGroupId) : activeGroupIndex;

    if (activeGroupIndex === -1) return;

    const activeGroup = newGroups[activeGroupIndex];
    const activeItemIndex = activeGroup.items.findIndex(item => item.id === activeId);

    if (activeItemIndex === -1) return;

    const [movedItem] = activeGroup.items.splice(activeItemIndex, 1);

    if (activeGroupId === overGroupId || overGroupIndex === activeGroupIndex) {
      // Moving within the same group
      const overItemIndex = activeGroup.items.findIndex(item => item.id === overId);
      const insertIndex = overItemIndex === -1 ? activeGroup.items.length : overItemIndex;
      activeGroup.items.splice(insertIndex, 0, movedItem);
    } else if (overGroupIndex !== -1) {
      // Moving to a different group
      const overGroup = newGroups[overGroupIndex];
      const overItemIndex = overGroup.items.findIndex(item => item.id === overId);
      const insertIndex = overItemIndex === -1 ? overGroup.items.length : overItemIndex;
      overGroup.items.splice(insertIndex, 0, movedItem);
    }

    updateGroups(newGroups);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900">Google My Business</h1>
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
                  <Button onClick={handleCreateMonth} className="bg-blue-600 hover:bg-blue-700 flex-1">
                    Criar
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>


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

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowObservationsDialog(true)}
            className={isMobile ? 'w-full' : ''}
          >
            <Settings className="h-4 w-4 mr-1" />
            Gerenciar Observações Padrões
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
              <div className="bg-blue-50 border-b border-gray-200 hover:bg-blue-100 transition-colors">
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
              {group.isExpanded && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={group.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                    {group.items.map((item, index) => (
                      <SortableGMBRow
                        key={item.id}
                        item={item}
                        groupId={group.id}
                        index={index}
                        selectedItems={selectedItems}
                        columns={columns}
                        onSelectItem={handleSelectItem}
                        onOpenClientDetails={openClientDetails}
                        onUpdateItemStatus={updateItemStatus}
                        onUpdateClientField={updateClient}
                        onDeleteClient={(clientId) => setConfirmDelete({ type: 'client', id: clientId })}
                        getClientFiles={getClientFiles}
                        statuses={statuses}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dialogs */}
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
              <Button onClick={handleDuplicateMonth} className="bg-blue-600 hover:bg-blue-700 flex-1">
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
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Grupo</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedGroupForClient}
                onChange={(e) => setSelectedGroupForClient(e.target.value)}
              >
                <option value="">Selecione um grupo</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              placeholder="Nome do cliente"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
            />
            <Input
              placeholder="Serviços"
              value={newClientServices}
              onChange={(e) => setNewClientServices(e.target.value)}
            />
            <div className="flex space-x-2">
              <Button onClick={handleCreateClient} className="bg-blue-600 hover:bg-blue-700 flex-1">
                Adicionar
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
              <h3 className="font-medium">Colunas Existentes</h3>
              {columns.map((column) => (
                <div key={column.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                  <div>
                    <span className="font-medium">{column.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({column.type})</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDelete({ type: 'column', id: column.id })}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Adicionar Nova Coluna</h3>
              <div className="space-y-2">
                <Input
                  placeholder="Nome da coluna"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                />
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newColumnType}
                  onChange={(e) => setNewColumnType(e.target.value as 'status' | 'text')}
                >
                  <option value="status">Status</option>
                  <option value="text">Texto</option>
                </select>
                <Button onClick={handleCreateColumn} className="w-full">
                  Adicionar Coluna
                </Button>
              </div>
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
              <Button onClick={handleUpdateMonth} className="bg-blue-600 hover:bg-blue-700 flex-1">
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setShowEditMonthDialog(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showStatusModal && (
        <CustomStatusModal
          open={showStatusModal}
          onOpenChange={setShowStatusModal}
          onAddStatus={addStatus}
          onUpdateStatus={updateStatus}
          onDeleteStatus={deleteStatus}
          existingStatuses={statuses}
        />
      )}

      {showClientDetails && (
        <ClientDetails
          open={!!showClientDetails}
          onOpenChange={(open) => {
            if (!open) {
              saveClientDetails();
            }
          }}
          clientName={groups.flatMap(g => g.items).find(item => item.id === showClientDetails)?.elemento || ''}
          observations={clientObservations}
          onUpdateObservations={setClientObservations}
          onFileChange={setClientFile}
          onFilePreview={openFilePreview}
          availableGroups={groups.map(g => ({ id: g.id, name: g.name }))}
          currentGroupId={groups.find(g => g.items.some(item => item.id === showClientDetails))?.id || ''}
          onMoveClient={(newGroupId) => showClientDetails && handleMoveClient(showClientDetails, newGroupId)}
          clientFile={clientFile}
          clientAttachments={getClientAttachments(showClientDetails).map(file => ({
            name: file.name,
            data: '',
            type: file.type,
            size: file.size
          }))}
        />
      )}

      {showFilePreview && previewFile && (
        <FilePreview
          file={previewFile}
          open={showFilePreview}
          onOpenChange={setShowFilePreview}
        />
      )}

      {/* Dialog de Observações Padrão */}
      <Dialog open={showObservationsDialog} onOpenChange={setShowObservationsDialog}>
        <DialogContent className={isMobile ? 'w-[95vw] max-w-none' : 'max-w-2xl'}>
          <DialogHeader>
            <DialogTitle>Gerenciar Observações Padrões</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Botão para criar observações baseadas no Grupo Forte */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Configuração Inicial</h4>
              <p className="text-sm text-blue-700 mb-3">
                Criar observações padrão baseadas no cliente "Grupo Forte" e aplicar em todos os clientes existentes.
              </p>
              <Button 
                onClick={async () => {
                  try {
                    await createDefaultObservationsFromGrupoForte();
                    alert('Observações padrão criadas e aplicadas com sucesso!');
                  } catch (error) {
                    alert('Erro ao criar observações padrão.');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Criar e Aplicar Observações do Grupo Forte
              </Button>
            </div>

            {/* Lista de observações padrão existentes */}
            <div className="space-y-2">
              <h4 className="font-medium">Observações Padrão Atuais ({defaultObservations.length})</h4>
              {defaultObservations.map((obs, index) => (
                <div key={obs.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    <span>{obs.text}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDelete({ type: 'observation', id: obs.id })}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {defaultObservations.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma observação padrão configurada. Use o botão acima para criar as observações do Grupo Forte.
                </p>
              )}
            </div>
            
            {/* Adicionar nova observação */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Adicionar Nova Observação</h4>
              <div className="flex space-x-2">
                <Input
                  placeholder="Digite a observação..."
                  value={newObservationText}
                  onChange={(e) => setNewObservationText(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={async () => {
                    if (newObservationText.trim()) {
                      try {
                        await addDefaultObservation(newObservationText.trim());
                        setNewObservationText('');
                      } catch (error) {
                        alert('Erro ao adicionar observação.');
                      }
                    }
                  }}
                  disabled={!newObservationText.trim()}
                >
                  Adicionar
                </Button>
              </div>
            </div>

            {/* Ações */}
            <div className="border-t pt-4 space-y-2">
              <Button 
                onClick={async () => {
                  try {
                    await applyDefaultObservationsToAllClients();
                    alert('Observações padrão aplicadas a todos os clientes!');
                  } catch (error) {
                    alert('Erro ao aplicar observações.');
                  }
                }}
                variant="outline"
                className="w-full"
                disabled={defaultObservations.length === 0}
              >
                Aplicar Observações Atuais a Todos os Clientes
              </Button>
              
              <Button 
                onClick={() => setShowObservationsDialog(false)}
                variant="outline"
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {confirmDelete && (
        <ConfirmationDialog
          open={!!confirmDelete}
          onOpenChange={(open) => open ? null : setConfirmDelete(null)}
          onConfirm={() => {
            if (confirmDelete.type === 'client') {
              handleDeleteClient(confirmDelete.id);
            } else if (confirmDelete.type === 'column') {
              handleDeleteColumn(confirmDelete.id);
            } else if (confirmDelete.type === 'month') {
              handleDeleteMonth(confirmDelete.id);
            } else if (confirmDelete.type === 'observation') {
              deleteDefaultObservation(confirmDelete.id);
              setConfirmDelete(null);
            }
          }}
          title={`Confirmar ${
            confirmDelete.type === 'client' ? 'Exclusão do Cliente' : 
            confirmDelete.type === 'column' ? 'Exclusão da Coluna' : 
            confirmDelete.type === 'month' ? 'Exclusão do Mês' :
            'Exclusão da Observação'
          }`}
          message={`Tem certeza de que deseja excluir ${
            confirmDelete.type === 'client' ? 'este cliente' : 
            confirmDelete.type === 'column' ? 'esta coluna' : 
            confirmDelete.type === 'month' ? 'este mês' :
            'esta observação padrão'
          }? Esta ação não pode ser desfeita.`}
        />
      )}
    </div>
  );
}