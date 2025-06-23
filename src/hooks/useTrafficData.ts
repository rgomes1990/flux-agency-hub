
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TrafficItem {
  id: string;
  elemento: string;
  servicos: string;
  observacoes?: string;
  attachments?: File[];
  [key: string]: any;
}

interface TrafficGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: TrafficItem[];
}

interface Status {
  id: string;
  name: string;
  color: string;
}

interface Column {
  id: string;
  name: string;
  type: 'status' | 'text';
  isDefault: boolean;
}

export const useTrafficData = () => {
  const [groups, setGroups] = useState<TrafficGroup[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([
    { id: 'active', name: 'Ativo', color: 'bg-green-500' },
    { id: 'paused', name: 'Pausado', color: 'bg-yellow-500' },
    { id: 'completed', name: 'Finalizado', color: 'bg-blue-500' }
  ]);
  const [columns, setColumns] = useState<Column[]>([
    { id: 'status', name: 'Status', type: 'status', isDefault: true },
    { id: 'plataforma', name: 'Plataforma', type: 'text', isDefault: true },
    { id: 'campanha', name: 'Campanha', type: 'text', isDefault: true },
    { id: 'investimento', name: 'Investimento', type: 'text', isDefault: true },
    { id: 'retorno', name: 'Retorno', type: 'text', isDefault: true }
  ]);

  const { user } = useAuth();

  const loadTrafficData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('traffic_data')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar dados de tráfego:', error);
        return;
      }

      if (data && data.length > 0) {
        const groupsMap = new Map<string, TrafficGroup>();

        data.forEach(item => {
          const itemData = typeof item.item_data === 'string' ? JSON.parse(item.item_data) : item.item_data;
          
          if (!groupsMap.has(item.group_id)) {
            groupsMap.set(item.group_id, {
              id: item.group_id,
              name: item.group_name,
              color: item.group_color,
              isExpanded: item.is_expanded,
              items: []
            });
          }

          const group = groupsMap.get(item.group_id)!;
          group.items.push(itemData);
        });

        setGroups(Array.from(groupsMap.values()));
      }
    } catch (error) {
      console.error('Erro ao carregar dados de tráfego:', error);
    }
  };

  useEffect(() => {
    loadTrafficData();
  }, [user]);

  const saveTrafficToDatabase = async (newGroups: TrafficGroup[]) => {
    if (!user) return;

    try {
      // Limpar dados existentes
      await supabase
        .from('traffic_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Inserir novos dados
      const insertData = [];
      for (const group of newGroups) {
        for (const item of group.items) {
          insertData.push({
            user_id: user.id,
            group_id: group.id,
            group_name: group.name,
            group_color: group.color,
            is_expanded: group.isExpanded,
            item_data: JSON.stringify(item)
          });
        }
      }

      if (insertData.length > 0) {
        const { error } = await supabase
          .from('traffic_data')
          .insert(insertData);

        if (error) {
          console.error('Erro ao salvar dados de tráfego:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar dados de tráfego:', error);
    }
  };

  const updateGroups = (newGroups: TrafficGroup[]) => {
    setGroups(newGroups);
    saveTrafficToDatabase(newGroups);
  };

  const createMonth = (monthName: string) => {
    const newGroup: TrafficGroup = {
      id: `group-${Date.now()}`,
      name: `${monthName} - TRÁFEGO`,
      color: 'bg-orange-500',
      isExpanded: true,
      items: []
    };
    const newGroups = [...groups, newGroup];
    setGroups(newGroups);
    saveTrafficToDatabase(newGroups);
  };

  const updateMonth = (monthId: string, newName: string) => {
    const newGroups = groups.map(group => 
      group.id === monthId 
        ? { ...group, name: `${newName} - TRÁFEGO` }
        : group
    );
    setGroups(newGroups);
    saveTrafficToDatabase(newGroups);
  };

  const deleteMonth = (monthId: string) => {
    const newGroups = groups.filter(group => group.id !== monthId);
    setGroups(newGroups);
    saveTrafficToDatabase(newGroups);
  };

  const duplicateMonth = async (sourceGroupId: string, newName: string) => {
    const sourceGroup = groups.find(g => g.id === sourceGroupId);
    if (!sourceGroup) return;

    const newGroup: TrafficGroup = {
      id: `group-${Date.now()}`,
      name: `${newName} - TRÁFEGO`,
      color: sourceGroup.color,
      isExpanded: true,
      items: sourceGroup.items.map(item => ({
        ...item,
        id: `traffic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
    };

    const newGroups = [...groups, newGroup];
    setGroups(newGroups);
    await saveTrafficToDatabase(newGroups);
  };

  const addStatus = (status: Status) => {
    setStatuses(prev => [...prev, status]);
  };

  const updateStatus = (statusId: string, updates: Partial<Status>) => {
    setStatuses(prev => prev.map(status => 
      status.id === statusId ? { ...status, ...updates } : status
    ));
  };

  const deleteStatus = (statusId: string) => {
    setStatuses(prev => prev.filter(status => status.id !== statusId));
  };

  const addColumn = (columnName: string, columnType: 'status' | 'text') => {
    const newColumn: Column = {
      id: `column-${Date.now()}`,
      name: columnName,
      type: columnType,
      isDefault: false
    };
    setColumns(prev => [...prev, newColumn]);
  };

  const updateColumn = (columnId: string, updates: Partial<Column>) => {
    setColumns(prev => prev.map(column => 
      column.id === columnId ? { ...column, ...updates } : column
    ));
  };

  const deleteColumn = (columnId: string) => {
    setColumns(prev => prev.filter(column => column.id !== columnId));
  };

  const updateItemStatus = (itemId: string, columnId: string, statusId: string) => {
    const newGroups = groups.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId ? { ...item, [columnId]: statusId } : item
      )
    }));
    setGroups(newGroups);
    saveTrafficToDatabase(newGroups);
  };

  const addClient = (groupId: string, clientData: { elemento: string; servicos: string }) => {
    const newItem: TrafficItem = {
      id: `traffic-${Date.now()}`,
      elemento: clientData.elemento,
      servicos: clientData.servicos,
      observacoes: '',
      attachments: []
    };

    const newGroups = groups.map(group => 
      group.id === groupId 
        ? { ...group, items: [...group.items, newItem] }
        : group
    );
    setGroups(newGroups);
    saveTrafficToDatabase(newGroups);
  };

  const deleteClient = (clientId: string) => {
    const newGroups = groups.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== clientId)
    }));
    setGroups(newGroups);
    saveTrafficToDatabase(newGroups);
  };

  const updateClient = (clientId: string, updates: any) => {
    const newGroups = groups.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === clientId ? { ...item, ...updates } : item
      )
    }));
    setGroups(newGroups);
    saveTrafficToDatabase(newGroups);
  };

  const getClientFiles = (clientId: string) => {
    for (const group of groups) {
      const client = group.items.find(item => item.id === clientId);
      if (client && client.attachments) {
        return client.attachments;
      }
    }
    return [];
  };

  return {
    groups,
    columns,
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
    getClientFiles
  };
};
