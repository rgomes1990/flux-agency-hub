import React, { useState } from 'react';
import { useGoogleMyBusinessData } from '@/hooks/useGoogleMyBusinessData';
import { SortableGMBRow } from '@/components/ClientManagement/SortableGMBRow';
import { ClientDetails } from '@/components/ClientManagement/ClientDetails';
import { AddServiceModal } from '@/components/ServiceManagement/AddServiceModal';
import { CustomStatusModal } from '@/components/ServiceManagement/CustomStatusModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Settings } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Dispatch, SetStateAction } from 'react';

interface GMBItem {
  id: string;
  elemento: string;
  status: string;
  servicos: string;
  observacoes: string;
  attachments?: any[];
  groupId: string;
}

export default function GoogleMyBusiness() {
  const {
    groups,
    createMonth,
    duplicateMonth,
    addClient,
    statuses,
    addColumn,
    addStatus,
    updateStatus,
    deleteStatus,
    updateColumn,
    moveColumnUp,
    moveColumnDown,
    deleteColumn,
    updateItemStatus,
    deleteClient,
    updateClient,
    updateGroups,
    updateMonth,
    deleteMonth,
    isLoading
  } = useGoogleMyBusinessData();
  const [selectedClient, setSelectedClient] = useState<GMBItem | null>(null);
  const [clientObservations, setClientObservations] = useState<{ id: string; text: string; completed: boolean; }[]>([]);
  const [addServiceModalOpen, setAddServiceModalOpen] = useState(false);
  const [customStatusModalOpen, setCustomStatusModalOpen] = useState(false);
  const [newMonthName, setNewMonthName] = useState('');
  const [clientFile, setClientFile] = useState<File | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;

      const activeGroup = groups.find(group => group.items.find(item => item.id === activeId));
      const overGroup = groups.find(group => group.items.find(item => item.id === overId));

      if (!activeGroup || !overGroup || activeGroup.id !== overGroup.id) {
        return;
      }

      const activeIndex = activeGroup.items.findIndex(item => item.id === activeId);
      const overIndex = overGroup.items.findIndex(item => item.id === overId);

      const newItems = arrayMove(activeGroup.items, activeIndex, overIndex);

      const newGroups = groups.map(group =>
        group.id === activeGroup.id ? { ...group, items: newItems } : group
      );

      updateGroups(newGroups);
    }
  };

  const handleMoveClient = (newGroupId: string) => {
    if (!selectedClient) return;

    const updatedGroups = groups.map(group => {
      if (group.id === selectedClient.groupId) {
        return {
          ...group,
          items: group.items.filter(item => item.id !== selectedClient.id)
        };
      } else if (group.id === newGroupId) {
        return {
          ...group,
          items: [...group.items, { ...selectedClient, groupId: newGroupId }]
        };
      }
      return group;
    });

    updateGroups(updatedGroups);
    setSelectedClient(null);
  };

  const handleUpdateAttachments = (attachments: any[]) => {
    // For GMB page, we don't need to handle attachments specially
    // This is just to satisfy the interface requirement
    console.log('Attachments updated:', attachments);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Google My Business</h1>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Novo Mês"
            value={newMonthName}
            onChange={(e) => setNewMonthName(e.target.value)}
            className="max-w-xs"
          />
          <Button
            variant="outline"
            onClick={() => {
              createMonth(newMonthName);
              setNewMonthName('');
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Mês
          </Button>
          <Button variant="secondary" onClick={() => setAddServiceModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Serviço
          </Button>
          <Button onClick={() => setCustomStatusModalOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar Status
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        groups.map(group => (
          <div key={group.id} className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={group.items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-6 gap-4">
                  <div className="font-semibold">Elemento</div>
                  <div className="font-semibold">Status</div>
                  <div className="font-semibold">Serviços</div>
                  <div className="font-semibold">Observações</div>
                  <div className="font-semibold">Ações</div>
                  <div></div>
                  {group.items.map(item => (
                    <SortableGMBRow
                      key={item.id}
                      id={item.id}
                      item={item}
                      statuses={statuses}
                      onStatusChange={(status) => updateItemStatus(item.id, 'status', status)}
                      onDelete={() => deleteClient(item.id)}
                      onEdit={() => {
                        setSelectedClient({ ...item, groupId: group.id });
                        setClientObservations(item.observacoes);
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        ))
      )}

      <ClientDetails
        open={selectedClient !== null}
        onOpenChange={(open) => !open && setSelectedClient(null)}
        clientName={selectedClient?.elemento || ''}
        observations={clientObservations}
        onUpdateObservations={setClientObservations}
        clientFile={clientFile}
        onFileChange={setClientFile}
        availableGroups={groups.map(g => ({ id: g.id, name: g.name }))}
        currentGroupId={selectedClient?.groupId || ''}
        onMoveClient={handleMoveClient}
        clientAttachments={selectedClient?.attachments || []}
        onUpdateAttachments={handleUpdateAttachments}
      />

      <AddServiceModal open={addServiceModalOpen} onOpenChange={setAddServiceModalOpen} />
      <CustomStatusModal
        open={customStatusModalOpen}
        onOpenChange={setCustomStatusModalOpen}
        statuses={statuses}
        addStatus={addStatus}
        updateStatus={updateStatus}
        deleteStatus={deleteStatus}
      />
    </div>
  );
}
