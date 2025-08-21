import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useSitesData } from '@/hooks/useSitesData';
import { SortableSitesRow } from '@/components/ClientManagement/SortableSitesRow';
import { ClientDetails } from '@/components/ClientManagement/ClientDetails';
import { AddServiceModal } from '@/components/ServiceManagement/AddServiceModal';
import { CustomStatusModal } from '@/components/ServiceManagement/CustomStatusModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Settings } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

interface SitesData {
  id: string;
  elemento: string;
  status: string;
  responsavel: string;
  link: string;
  login: string;
  senha: string;
  observacoes: string;
  groupId: string;
  attachments?: Array<{
    name: string;
    path?: string;
    size?: number;
    type: string;
    data?: string;
  }>;
}

export default function Sites() {
  const {
    groups,
    statuses,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
    updateItemStatus,
    updateGroups,
    updateMonth,
    deleteMonth,
    duplicateMonth
  } = useSitesData();

  const [selectedClient, setSelectedClient] = useState<SitesData | null>(null);
  const [clientObservations, setClientObservations] = useState<{ id: string; text: string; completed: boolean; }[]>([]);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isCustomStatusModalOpen, setIsCustomStatusModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [clientFile, setClientFile] = useState<File | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (selectedClient) {
      setClientObservations(selectedClient.observacoes ? JSON.parse(selectedClient.observacoes) : []);
    } else {
      setClientObservations([]);
    }
  }, [selectedClient]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;

      const activeGroup = groups.find(group => group.items.some(item => item.id === activeId));
      const overGroup = groups.find(group => group.items.some(item => item.id === overId));

      if (!activeGroup || !overGroup) return;

      if (activeGroup.id === overGroup.id) {
        const newItems = arrayMove(activeGroup.items, activeGroup.items.findIndex(item => item.id === activeId), activeGroup.items.findIndex(item => item.id === overId));

        const newGroups = groups.map(group =>
          group.id === activeGroup.id ? { ...group, items: newItems } : group
        );

        updateGroups(newGroups);
      } else {
        const activeItem = activeGroup.items.find(item => item.id === activeId);
        const overItem = overGroup.items.find(item => item.id === overId);

        if (!activeItem || !overItem) return;

        const newActiveGroupItems = activeGroup.items.filter(item => item.id !== activeId);
        const newOverGroupItems = [...overGroup.items.slice(0, overGroup.items.findIndex(item => item.id === overId)), activeItem, ...overGroup.items.slice(overGroup.items.findIndex(item => item.id === overId))];

        const newGroups = groups.map(group => {
          if (group.id === activeGroup.id) {
            return { ...group, items: newActiveGroupItems };
          } else if (group.id === overGroup.id) {
            return { ...group, items: newOverGroupItems };
          }
          return group;
        });

        updateGroups(newGroups);
      }
    }
  };

  const handleCreateMonth = () => {
    const monthName = prompt('Digite o nome do novo mês:');
    if (monthName) {
      // createMonth(monthName);
    }
  };

  const handleDuplicateMonth = (groupId: string) => {
    const newMonthName = prompt('Digite o nome para o novo mês (cópia):');
    if (newMonthName) {
      duplicateMonth(groupId, newMonthName);
    }
  };

  const handleAddClient = () => {
    if (newClientName.trim() !== '') {
      const selectedGroupId = prompt('Digite o ID do grupo (mês) para adicionar este cliente:');
      if (selectedGroupId) {
        addClient(selectedGroupId, { elemento: newClientName });
        setNewClientName('');
      }
    }
  };

  const handleDeleteClient = (itemId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClient(itemId);
    }
  };

  const handleUpdateStatus = (itemId: string, statusId: string) => {
    updateItemStatus(itemId, 'status', statusId);
  };

  const handleMoveClient = (newGroupId: string) => {
    if (selectedClient) {
      updateClient(selectedClient.id, { groupId: newGroupId });
      setSelectedClient(null);
    }
  };

  const handleFileChange = (file: File | null) => {
    setClientFile(file);
  };

  const handleUpdateAttachments = (attachments: any[]) => {
    if (selectedClient) {
      updateClient(selectedClient.id, { attachments });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Sites</h1>
        <div className="space-x-2">
          <Button onClick={() => setIsAddServiceModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Serviço
          </Button>
          <Button onClick={() => setIsCustomStatusModalOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Gerenciar Status
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <Input
          type="text"
          placeholder="Nome do novo cliente"
          value={newClientName}
          onChange={(e) => setNewClientName(e.target.value)}
        />
        <Button onClick={handleAddClient}>Adicionar Cliente</Button>
      </div>

      <DndContext
        modifiers={[restrictToVerticalAxis]}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.id} className="border rounded-md p-4">
              <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
              <SortableContext
                id={group.id}
                items={group.items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-7 gap-4">
                  <div className="font-semibold">Cliente</div>
                  <div className="font-semibold">Status</div>
                  <div className="font-semibold">Responsável</div>
                  <div className="font-semibold">Link</div>
                  <div className="font-semibold">Login</div>
                  <div className="font-semibold">Senha</div>
                  <div className="font-semibold">Ações</div>
                  {group.items.map((item) => (
                    <SortableSitesRow
                      key={item.id}
                      id={item.id}
                      item={item}
                      statuses={statuses}
                      onUpdateStatus={handleUpdateStatus}
                      onDelete={handleDeleteClient}
                      onEdit={() => setSelectedClient({ ...item, groupId: group.id })}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      <ClientDetails
        open={selectedClient !== null}
        onOpenChange={(open) => !open && setSelectedClient(null)}
        clientName={selectedClient?.elemento || ''}
        observations={clientObservations}
        onUpdateObservations={setClientObservations}
        clientFile={clientFile}
        onFileChange={handleFileChange}
        availableGroups={groups.map(g => ({ id: g.id, name: g.name }))}
        currentGroupId={selectedClient?.groupId || ''}
        onMoveClient={handleMoveClient}
        clientAttachments={selectedClient?.attachments || []}
        onUpdateAttachments={handleUpdateAttachments}
      />

      <AddServiceModal open={isAddServiceModalOpen} onOpenChange={setIsAddServiceModalOpen} />
      <CustomStatusModal open={isCustomStatusModalOpen} onOpenChange={setIsCustomStatusModalOpen} />
    </div>
  );
}
