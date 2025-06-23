
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TrafficData {
  id: string;
  cliente: string;
  mes: string;
  status: string;
  plataforma: string;
  campanha: string;
  investimento: string;
  retorno: string;
  observacoes: string;
  attachments?: File[];
}

interface TrafficGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: TrafficData[];
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
    { id: 'cliente', name: 'Cliente', type: 'text', isDefault: true },
    { id: 'mes', name: 'Mês', type: 'text', isDefault: true },
    { id: 'status', name: 'Status', type: 'status', isDefault: true },
    { id: 'plataforma', name: 'Plataforma', type: 'text', isDefault: true },
    { id: 'campanha', name: 'Campanha', type: 'text', isDefault: true },
    { id: 'investimento', name: 'Investimento', type: 'text', isDefault: true },
    { id: 'retorno', name: 'Retorno', type: 'text', isDefault: true },
    { id: 'observacoes', name: 'Observações', type: 'text', isDefault: true }
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

  const addData = (newData: Omit<TrafficData, 'id'>) => {
    const data: TrafficData = {
      id: `traffic-${Date.now()}`,
      ...newData
    };

    // Encontrar grupo do mês ou criar novo
    let targetGroup = groups.find(g => g.name === newData.mes);
    
    if (!targetGroup) {
      targetGroup = {
        id: `group-${Date.now()}`,
        name: newData.mes,
        color: 'bg-red-500',
        isExpanded: true,
        items: []
      };
      const newGroups = [...groups, targetGroup];
      targetGroup.items.push(data);
      setGroups(newGroups);
      saveTrafficToDatabase(newGroups);
    } else {
      const newGroups = groups.map(group => 
        group.id === targetGroup!.id 
          ? { ...group, items: [...group.items, data] }
          : group
      );
      setGroups(newGroups);
      saveTrafficToDatabase(newGroups);
    }

    return data.id;
  };

  const updateData = (id: string, updates: Partial<TrafficData>) => {
    const newGroups = groups.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }));
    setGroups(newGroups);
    saveTrafficToDatabase(newGroups);
  };

  const deleteData = (id: string) => {
    const newGroups = groups.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== id)
    }));
    setGroups(newGroups);
    saveTrafficToDatabase(newGroups);
  };

  const duplicateMonth = async (mes: string) => {
    const sourceGroup = groups.find(g => g.name === mes);
    if (!sourceGroup || sourceGroup.items.length === 0) return;

    // Criar novo nome para o mês duplicado
    const newMonthName = `${mes} - Cópia`;
    
    // Verificar se já existe
    if (groups.some(g => g.name === newMonthName)) {
      console.warn('Já existe uma cópia deste mês');
      return;
    }

    const newGroup: TrafficGroup = {
      id: `group-${Date.now()}`,
      name: newMonthName,
      color: sourceGroup.color,
      isExpanded: true,
      items: sourceGroup.items.map(item => ({
        ...item,
        id: `traffic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        mes: newMonthName
      }))
    };

    const newGroups = [...groups, newGroup];
    setGroups(newGroups);
    await saveTrafficToDatabase(newGroups);
  };

  const getClients = () => {
    const clients = new Set<string>();
    groups.forEach(group => {
      group.items.forEach(item => {
        if (item.cliente) clients.add(item.cliente);
      });
    });
    return Array.from(clients);
  };

  const getMonths = () => {
    return groups.map(group => group.name);
  };

  const updateGroups = (newGroups: TrafficGroup[]) => {
    setGroups(newGroups);
    saveTrafficToDatabase(newGroups);
  };

  const createMonth = (monthName: string) => {
    const newGroup: TrafficGroup = {
      id: `group-${Date.now()}`,
      name: monthName,
      color: 'bg-red-500',
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
        ? { ...group, name: newName, items: group.items.map(item => ({ ...item, mes: newName })) }
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

  const addColumn = (column: Column) => {
    setColumns(prev => [...prev, column]);
  };

  const updateColumn = (columnId: string, updates: Partial<Column>) => {
    setColumns(prev => prev.map(column => 
      column.id === columnId ? { ...column, ...updates } : column
    ));
  };

  const deleteColumn = (columnId: string) => {
    setColumns(prev => prev.filter(column => column.id !== columnId));
  };

  const updateItemStatus = (itemId: string, newStatus: string) => {
    updateData(itemId, { status: newStatus });
  };

  const addClient = (clientName: string) => {
    // Implementar se necessário
  };

  const deleteClient = (clientName: string) => {
    // Implementar se necessário
  };

  const updateClient = (oldName: string, newName: string) => {
    const newGroups = groups.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.cliente === oldName ? { ...item, cliente: newName } : item
      )
    }));
    setGroups(newGroups);
    saveTrafficToDatabase(newGroups);
  };

  const getClientFiles = (clientName: string) => {
    // Implementar se necessário
    return [];
  };

  return {
    data: groups.flatMap(group => group.items),
    groups,
    columns,
    statuses,
    addData,
    updateData,
    deleteData,
    duplicateMonth,
    getClients,
    getMonths,
    updateGroups,
    createMonth,
    updateMonth,
    deleteMonth,
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
