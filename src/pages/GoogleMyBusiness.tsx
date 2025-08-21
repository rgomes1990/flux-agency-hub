import React, { useState } from 'react';
import { useGoogleMyBusinessData } from '@/hooks/useGoogleMyBusinessData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Copy,
  Settings,
  Edit,
  Trash2,
  Menu,
  ChevronUp,
  ChevronDown as ChevronDownIcon
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatusButton } from '@/components/ServiceManagement/StatusButton';
import { CustomStatusModal } from '@/components/ServiceManagement/CustomStatusModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClientDetails } from '@/components/ClientManagement/ClientDetails';
import { SortableGMBRow } from '@/components/ClientManagement/SortableGMBRow';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  arrayMove 
} from '@dnd-kit/sortable';

export default function GoogleMyBusiness() {
  const isMobile = useIsMobile();
  const { 
    groups, 
    columns,
    customColumns,
    statuses,
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
    moveColumnUp,
    moveColumnDown
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
  const [newClientName, setNewClientName] = useState('');
  const [newClientServices, setNewClientServices] = useState('');
  const [newClientInfo, setNewClientInfo] = useState('');
  const [selectedGroupForClient, setSelectedGroupForClient] = useState('');
  const [clientFile, setClientFile] = useState<File | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<'status' | 'text'>('status');
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'client' | 'column' | 'month', id: string } | null>(null);
  const [editingMonth, setEditingMonth] = useState<{ id: string, name: string } | null>(null);
  const [showEditMonthDialog, setShowEditMonthDialog] = useState(false);
  const [showMobileToolbar, setShowMobileToolbar] = useState(false);
  const [clientObservations, setClientObservations] = useState<Array<{id: string, text: string, completed: boolean}>>([]);
  const [clientAttachments, setClientAttachments] = useState<Array<{ name: string; data: string; type: string; size?: number }>>([]);

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
    
    await duplicateMonth(selectedGroupToDuplicate, duplicateMonthName);
    setDuplicateMonthName('');
    setSelectedGroupToDuplicate('');
    setShowDuplicateDialog(false);
  };

  const handleCreateClient = () => {
    if (!newClientName.trim() || !selectedGroupForClient) return;
    
    addClient(selectedGroupForClient, {
      elemento: newClientName,
      servicos: newClientServices,
      informacoes: newClientInfo
    });
    
    setNewClientName('');
    setNewClientServices('');
    setNewClientInfo('');
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
      const nameWithoutSuffix = group.name.replace(' - Google My Business', '');
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeGroupId = active.data.current?.groupId;
    const group = groups.find(g => g.id === activeGroupId);
    
    if (!group) return;

    const oldIndex = group.items.findIndex(item => item.id === active.id);
    const newIndex = group.items.findIndex(item => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(group.items, oldIndex, newIndex);
      const updatedGroups = groups.map(g => 
        g.id === activeGroupId 
          ? { ...g, items: newItems }
          : g
      );
      updateGroups(updatedGroups);
    }
  };

  const openClientDetails = (clientId: string) => {
    const client = groups.flatMap(g => g.items).find(item => item.id === clientId);
    if (client) {
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

      try {
        let attachmentsToSet = [];
        if (typeof client.attachments === 'string') {
          const parsed = JSON.parse(client.attachments);
          attachmentsToSet = Array.isArray(parsed) ? parsed : [];
        } else if (Array.isArray(client.attachments)) {
          attachmentsToSet = client.attachments;
        }
        setClientAttachments(attachmentsToSet);
      } catch {
        setClientAttachments([]);
      }
      
      setShowClientDetails(clientId);
    }
  };

  const handleClientDetailsClose = async (open: boolean) => {
    if (!open && showClientDetails) {
      try {
        const updates: any = { 
          observacoes: JSON.stringify(clientObservations)
        };

        if (clientAttachments && clientAttachments.length > 0) {
          updates.attachments = clientAttachments;
        }
        
        await updateClient(showClientDetails, updates);
      } catch (error) {
        console.error('Erro ao salvar cliente:', error);
      }

      setShowClientDetails(null);
      setClientObservations([]);
      setClientAttachments([]);
      setClientFile(null);
    }
  };

  const handleMoveClient = (clientId: string, newGroupId: string) => {
    const client = groups.flatMap(g => g.items).find(item => item.id === clientId);
    
    if (client) {
      deleteClient(clientId);
      
      addClient(newGroupId, {
        elemento: client.elemento,
        servicos: client.servicos || '',
        informacoes: client.informacoes || '',
        observacoes: client.observacoes,
        status: client.status,
        ...client
      });
      
      setShowClientDetails(null);
    }
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
      <div className="flex-1 relative">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div 
            className="h-full overflow-x-auto overflow-y-auto" 
            style={{ 
              paddingBottom: '10px',
              scrollbarWidth: 'auto',
              scrollbarColor: '#6b7280 #f3f4f6'
            }}
          >
            <div className="min-w-max" style={{ minWidth: '1200px' }}>
          {/* Table Header */}
          <div className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
            <div className="flex items-center min-w-max">
              <div className="w-8 flex items-center justify-center p-2">
                <Checkbox
                  checked={selectedItems.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </div>
                <div className="w-56 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Cliente</div>
                <div className="w-44 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Serviços</div>
                <div className="w-64 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Informações</div>
              {customColumns.map((column) => (
                <div key={column.id} className="w-44 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">
                  {column.name}
                </div>
              ))}
              <div className="w-20 p-2 text-xs font-medium text-gray-600">Ações</div>
            </div>
          </div>

          {/* Group Items */}
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
                <SortableContext 
                  items={group.items.map(item => item.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  {group.items.map((item, index) => (
                    <SortableGMBRow 
                      key={item.id}
                      item={item}
                      groupId={group.id}
                      index={index}
                      selectedItems={selectedItems}
                      columns={customColumns}
                      onSelectItem={handleSelectItem}
                      onOpenClientDetails={openClientDetails}
                      onUpdateItemStatus={updateItemStatus}
                      onUpdateClientField={updateClient}
                      onDeleteClient={(clientId) => setConfirmDelete({ type: 'client', id: clientId })}
                      getClientFiles={() => []}
                      statuses={statuses}
                    />
                  ))}
                </SortableContext>
              )}
            </div>
          ))}
            </div>
          </div>
        </DndContext>
      </div>

      {/* Duplicate Month Dialog */}
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

      {/* Add Client Dialog */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent className={isMobile ? 'w-[95vw] max-w-none' : ''}>
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Mês</label>
              <select
                value={selectedGroupForClient}
                onChange={(e) => setSelectedGroupForClient(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Selecione um mês</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              placeholder="Elemento"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
            />
            <Input
              placeholder="Serviços (ex: Gestão de Redes Sociais)"
              value={newClientServices}
              onChange={(e) => setNewClientServices(e.target.value)}
            />
            <Input
              placeholder="Informações (ex: Telefone, Endereço)"
              value={newClientInfo}
              onChange={(e) => setNewClientInfo(e.target.value)}
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

      {/* Column Management Dialog */}
      <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
        <DialogContent className={isMobile ? 'w-[95vw] max-w-none' : ''}>
          <DialogHeader>
            <DialogTitle>Gerenciar Colunas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Colunas Existentes:</h4>
              {customColumns.map((column, index) => (
                <div key={column.id} className="flex items-center justify-between p-3 border rounded bg-gray-50">
                  <span className="text-sm font-medium">
                    {column.name} ({column.type})
                  </span>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveColumnUp(column.id)}
                      disabled={index === 0}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      title="Mover para cima"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveColumnDown(column.id)}
                      disabled={index === customColumns.length - 1}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      title="Mover para baixo"
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmDelete({ type: 'column', id: column.id })}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                      title="Excluir coluna"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <Input
                placeholder="Nome da coluna"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
              />
              <div className="space-y-2 mt-2">
                <label className="text-sm font-medium">Tipo da Coluna</label>
                <select
                  value={newColumnType}
                  onChange={(e) => setNewColumnType(e.target.value as 'status' | 'text')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="status">Status (com cores)</option>
                  <option value="text">Texto livre</option>
                </select>
                <Button onClick={handleCreateColumn} className="w-full bg-blue-600 hover:bg-blue-700">
                  Criar Coluna
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Month Dialog */}
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

      {/* Status Management Modal */}
      <CustomStatusModal
        open={showStatusModal}
        onOpenChange={setShowStatusModal}
        onAddStatus={(status) => addStatus(status.name, status.color)}
        onUpdateStatus={updateStatus}
        onDeleteStatus={deleteStatus}
        existingStatuses={statuses}
      />

      {/* Client Details Modal */}
      {showClientDetails && (
        <ClientDetails
          open={!!showClientDetails}
          onOpenChange={handleClientDetailsClose}
          clientName={groups.flatMap(g => g.items).find(item => item.id === showClientDetails)?.elemento || ''}
          observations={clientObservations}
          onUpdateObservations={setClientObservations}
          clientFile={clientFile}
          onFileChange={setClientFile}
          availableGroups={groups.map(g => ({ id: g.id, name: g.name }))}
          currentGroupId={groups.find(g => g.items.some(item => item.id === showClientDetails))?.id || ''}
          onMoveClient={(newGroupId) => handleMoveClient(showClientDetails, newGroupId)}
          clientAttachments={clientAttachments}
          onUpdateAttachments={setClientAttachments}
        />
      )}

      {/* Confirmation Dialogs */}
      {confirmDelete && (
        <ConfirmationDialog
          open={!!confirmDelete}
          onOpenChange={() => setConfirmDelete(null)}
          onConfirm={() => {
            if (confirmDelete.type === 'client') {
              handleDeleteClient(confirmDelete.id);
            } else if (confirmDelete.type === 'column') {
              handleDeleteColumn(confirmDelete.id);
            } else if (confirmDelete.type === 'month') {
              handleDeleteMonth(confirmDelete.id);
            }
          }}
          title={`Confirmar ${confirmDelete.type === 'client' ? 'exclusão do cliente' : confirmDelete.type === 'column' ? 'exclusão da coluna' : 'exclusão do mês'}`}
          message={`Tem certeza de que deseja ${confirmDelete.type === 'client' ? 'excluir este cliente' : confirmDelete.type === 'column' ? 'excluir esta coluna' : 'excluir este mês'}? Esta ação não pode ser desfeita.`}
        />
      )}
    </div>
  );
}
