import React, { useState } from 'react';
import { useRSGAvaliacoesData } from '@/hooks/useRSGAvaliacoesData';
import { SortableRSGRow } from '@/components/ClientManagement/SortableRSGRow';
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

interface RSGAvaliacoesItem {
  id: string;
  elemento: string;
  status: string;
  servicos: string;
  observacoes: string;
  attachments?: string[];
  [key: string]: any;
}

export default function RSGAvaliacoes() {
  const {
    groups,
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
    addClient,
    createMonth,
    duplicateMonth,
    customColumns,
    isLoading
  } = useRSGAvaliacoesData();
  const [selectedClient, setSelectedClient] = useState<RSGAvaliacoesItem | null>(null);
  const [addServiceModalOpen, setAddServiceModalOpen] = useState(false);
  const [customStatusModalOpen, setCustomStatusModalOpen] = useState(false);
  const [clientObservations, setClientObservations] = useState<{ id: string; text: string; completed: boolean; }[]>([]);
  const [clientFile, setClientFile] = useState<File | null>(null);

  const sensor = useSensor(PointerSensor);
  const sensors = useSensors(
    sensor,
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const activeGroup = groups.find(group => group.items.find(item => item.id === active.id));
      const overGroup = groups.find(group => group.items.find(item => item.id === over?.id));

      if (activeGroup && overGroup && activeGroup.id === overGroup.id) {
        const updatedGroups = groups.map(group => {
          if (group.id === activeGroup.id) {
            const oldIndex = group.items.findIndex(item => item.id === active.id);
            const newIndex = group.items.findIndex(item => item.id === over?.id);

            return { ...group, items: arrayMove(group.items, oldIndex, newIndex) };
          }
          return group;
        });
        updateGroups(updatedGroups);
      }
    }
  };

  const handleOpenClientDetails = (client: RSGAvaliacoesItem) => {
    setSelectedClient(client);
    setClientObservations(client.observacoes ? JSON.parse(client.observacoes) : []);
  };

  const handleMoveClient = (newGroupId: string) => {
    if (!selectedClient) return;

    updateClient(selectedClient.id, { groupId: newGroupId });
    setSelectedClient(null);
  };

  const handleUpdateAttachments = (attachments: any[]) => {
    // For RSG page, we don't need to handle attachments specially
    // This is just to satisfy the interface requirement
    console.log('Attachments updated:', attachments);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">RSG Avaliações</h1>
        <div className="space-x-2">
          <Button onClick={() => setAddServiceModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Serviço
          </Button>
          <Button onClick={() => setCustomStatusModalOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar Status
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        {groups.map((group) => (
          <div key={group.id} className="mb-4">
            <div className="flex items-center justify-between p-2 bg-gray-100 rounded-t">
              <h2 className="text-lg font-medium">{group.name}</h2>
              <div className="space-x-2">
                <Button size="sm" onClick={() => {
                  const newName = prompt("Novo nome para o mês:", group.name);
                  if (newName) {
                    updateMonth(group.id, newName);
                  }
                }}>Renomear</Button>
                <Button size="sm" onClick={() => {
                  const confirmDelete = window.confirm("Tem certeza que deseja excluir este mês e todos os dados associados?");
                  if (confirmDelete) {
                    deleteMonth(group.id);
                  }
                }}>Excluir</Button>
                <Button size="sm" onClick={() => {
                  const newMonthName = prompt("Nome para o novo mês duplicado:", `Cópia de ${group.name}`);
                  if (newMonthName) {
                    duplicateMonth(group.id, newMonthName);
                  }
                }}>Duplicar</Button>
                <Button size="sm" variant="outline" onClick={() => {
                  const clientName = prompt("Nome do cliente:");
                  if (clientName) {
                    addClient(group.id, { elemento: clientName });
                  }
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Cliente
                </Button>
              </div>
            </div>
            <SortableContext
              id={group.id}
              items={group.items.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="bg-white rounded-b shadow-md overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Elemento
                      </th>
                      {customColumns.map(column => (
                        <th key={column.id} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {column.name}
                        </th>
                      ))}
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => (
                      <SortableRSGRow
                        key={item.id}
                        id={item.id}
                        item={item}
                        statuses={statuses}
                        customColumns={customColumns}
                        updateItemStatus={updateItemStatus}
                        deleteClient={deleteClient}
                        onOpenClientDetails={() => handleOpenClientDetails(item)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </SortableContext>
          </div>
        ))}
      </DndContext>

      <ClientDetails
        open={selectedClient !== null}
        onOpenChange={() => setSelectedClient(null)}
        clientName={selectedClient?.elemento || ''}
        observations={clientObservations}
        onUpdateObservations={setClientObservations}
        clientFile={null}
        onFileChange={() => {}}
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
        addColumn={addColumn}
        addStatus={addStatus}
        updateStatus={updateStatus}
        deleteStatus={deleteStatus}
        updateColumn={updateColumn}
        moveColumnUp={moveColumnUp}
        moveColumnDown={moveColumnDown}
        deleteColumn={deleteColumn}
      />
    </div>
  );
}
