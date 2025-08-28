import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search,
  Filter,
  Settings,
  MoreHorizontal,
  Calendar,
  Users,
  Folder,
  Layout
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useContentData } from '@/hooks/useContentData';
import { CustomStatusModal } from '@/components/ServiceManagement/CustomStatusModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { FilePreview } from '@/components/FilePreview';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClientDetails } from '@/components/ClientManagement/ClientDetails';
import { ContentGroupCard } from '@/components/ContentManagement/ContentGroupCard';
import { ContentHeader } from '@/components/ContentManagement/ContentHeader';
import { ContentToolbar } from '@/components/ContentManagement/ContentToolbar';
import { CreateMonthDialog } from '@/components/ContentManagement/CreateMonthDialog';
import { DuplicateMonthDialog } from '@/components/ContentManagement/DuplicateMonthDialog';
import { CreateClientDialog } from '@/components/ContentManagement/CreateClientDialog';
import { ManageColumnsDialog } from '@/components/ContentManagement/ManageColumnsDialog';
import { EditMonthDialog } from '@/components/ContentManagement/EditMonthDialog';

export default function Content() {
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
    moveColumnUp,
    moveColumnDown,
    updateItemStatus,
    addClient,
    deleteClient,
    updateClient,
    getClientFiles
  } = useContentData();
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'client' | 'column' | 'month', id: string } | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [clientObservations, setClientObservations] = useState<Array<{id: string, text: string, completed: boolean}>>([]);

  // Filter groups based on search
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.items.some(item => 
      item.elemento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.servicos.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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

  const handleDeleteClient = (clientId: string) => {
    deleteClient(clientId);
    setConfirmDelete(null);
  };

  const handleDeleteColumn = (columnId: string) => {
    deleteColumn(columnId);
    setConfirmDelete(null);
  };

  const handleDeleteMonth = (groupId: string) => {
    deleteMonth(groupId);
    setConfirmDelete(null);
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
      setShowClientDetails(clientId);
    }
  };

  const saveClientDetails = async () => {
    if (showClientDetails) {
      const updates: any = { 
        observacoes: JSON.stringify(clientObservations) 
      };
      await updateClient(showClientDetails, updates);
    }
    setShowClientDetails(null);
    setClientObservations([]);
  };

  const handleMoveClient = (clientId: string, newGroupId: string) => {
    const client = groups.flatMap(g => g.items).find(item => item.id === clientId);
    const oldGroup = groups.find(g => g.items.some(item => item.id === clientId));
    
    if (client && oldGroup) {
      deleteClient(clientId);
      addClient(newGroupId, {
        elemento: client.elemento,
        servicos: client.servicos || '',
        observacoes: client.observacoes,
        ...client
      });
      setShowClientDetails(null);
    }
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

  const openFilePreview = (file: File) => {
    setPreviewFile(file);
    setShowFilePreview(true);
  };

  const handleStatusUpdate = (statusId: string, updates: { name: string; color: string }) => {
    updateStatus({ id: statusId, ...updates });
  };

  const handleUpdateItemStatus = (itemId: string, field: string, statusId: string) => {
    const status = statuses.find(s => s.id === statusId);
    if (!status) return;

    const updatedGroups = groups.map(group => ({
      ...group,
      items: group.items.map(item => {
        if (item.id === itemId) {
          return { ...item, [field]: statusId };
        }
        return item;
      })
    }));

    updateGroups(updatedGroups);
    updateClient(itemId, { [field]: statusId });
  };

  const handleCreateMonth = (name: string) => {
    createMonth(name);
  };

  const handleDuplicateMonth = (sourceGroupId: string, newName: string) => {
    duplicateMonth(sourceGroupId, newName);
  };

  const handleUpdateColumns = (columns: any[]) => {
    // Implementation for updating columns
    console.log('Updating columns:', columns);
  };

  return (
    <div className="min-h-screen bg-background">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* Header */}
        <ContentHeader 
          totalGroups={groups.length}
          totalColumns={columns.length}
          totalStatuses={statuses.length}
          selectedItemsCount={selectedItems.length}
          onSelectAll={handleSelectAll}
        />

        {/* Toolbar */}
        <ContentToolbar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedItems={selectedItems}
          groups={groups}
          customColumns={customColumns}
          onCreateMonth={handleCreateMonth}
          onDuplicateMonth={handleDuplicateMonth}
          onAddClient={addClient}
          onUpdateColumns={handleUpdateColumns}
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredGroups.map((group) => (
              <ContentGroupCard
                key={group.id}
                group={group}
                customColumns={customColumns}
                statuses={statuses}
                selectedItems={selectedItems}
                onSelectItem={handleSelectItem}
                onOpenClientDetails={openClientDetails}
                onUpdateItemStatus={handleUpdateItemStatus}
                onDeleteClient={(clientId) => setConfirmDelete({ type: 'client', id: clientId })}
                onEditMonth={(groupId) => {
                  // Handle edit month logic here
                }}
                onDeleteMonth={(groupId) => setConfirmDelete({ type: 'month', id: groupId })}
                viewMode={viewMode}
              />
            ))}
          </div>

          {filteredGroups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum conteúdo encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Tente ajustar sua pesquisa' : 'Comece criando seu primeiro mês de conteúdo'}
              </p>
              {!searchTerm && (
                <CreateMonthDialog 
                  onCreateMonth={handleCreateMonth}
                  trigger={
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Mês
                    </Button>
                  }
                />
              )}
            </div>
          )}
        </div>
      </DndContext>

      {/* Dialogs */}
      <CreateMonthDialog onCreateMonth={handleCreateMonth} />
      <DuplicateMonthDialog groups={groups} onDuplicateMonth={handleDuplicateMonth} />
      <CreateClientDialog groups={groups} onAddClient={addClient} />
      <ManageColumnsDialog 
        customColumns={customColumns}
        onUpdateColumns={handleUpdateColumns}
        onAddColumn={addColumn}
        onMoveColumnUp={moveColumnUp}
        onMoveColumnDown={moveColumnDown}
        onDeleteColumn={(columnId) => setConfirmDelete({ type: 'column', id: columnId })}
      />
      <EditMonthDialog 
        groups={groups}
        onUpdateMonth={updateMonth}
      />

      {showClientDetails && (
        <ClientDetails
          open={!!showClientDetails}
          onOpenChange={(open) => !open && setShowClientDetails(null)}
          clientName={groups.flatMap(g => g.items).find(item => item.id === showClientDetails)?.elemento || ''}
          observations={clientObservations}
          onUpdateObservations={(newObservations) => {
            setClientObservations(newObservations);
            const clientItem = groups.flatMap(g => g.items).find(item => item.id === showClientDetails);
            if (clientItem) {
              updateClient(showClientDetails!, { observacoes: JSON.stringify(newObservations) });
            }
          }}
          clientFile={null}
          onFileChange={() => {}}
          onFilePreview={openFilePreview}
          availableGroups={groups}
          currentGroupId={groups.find(g => g.items.some(item => item.id === showClientDetails))?.id || ''}
          onMoveClient={(newGroupId) => handleMoveClient(showClientDetails!, newGroupId)}
          clientAttachments={groups.flatMap(g => g.items).find(item => item.id === showClientDetails)?.attachments || []}
          onUpdateAttachments={(attachments) => {
            if (showClientDetails) {
              updateClient(showClientDetails, { attachments });
            }
          }}
        />
      )}

      <CustomStatusModal
        open={showStatusModal}
        onOpenChange={setShowStatusModal}
        onAddStatus={addStatus}
        onUpdateStatus={handleStatusUpdate}
        onDeleteStatus={deleteStatus}
        existingStatuses={statuses}
      />

      <FilePreview
        file={previewFile}
        open={showFilePreview}
        onOpenChange={setShowFilePreview}
      />

      <ConfirmationDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete?.type === 'client') {
            handleDeleteClient(confirmDelete.id);
          } else if (confirmDelete?.type === 'column') {
            handleDeleteColumn(confirmDelete.id);
          } else if (confirmDelete?.type === 'month') {
            handleDeleteMonth(confirmDelete.id);
          }
        }}
        title="Confirmar Exclusão"
        message={
          confirmDelete?.type === 'client' 
            ? "Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
            : confirmDelete?.type === 'month'
            ? "Tem certeza que deseja excluir este mês e todos os seus clientes? Esta ação não pode ser desfeita."
            : "Tem certeza que deseja excluir esta coluna? Esta ação não pode ser desfeita."
        }
        confirmText="Excluir"
      />
    </div>
  );
}
