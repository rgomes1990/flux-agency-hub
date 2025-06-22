
import { useState, useEffect } from 'react';

export interface TrafficData {
  id: string;
  cliente: string;
  mes: string;
  investimento: number;
  resultado: number;
  roi: number;
  roas: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversoes: number;
  attachments?: File[];
  observacoes?: string;
  elemento: string;
  servicos: string;
}

export interface TrafficGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: TrafficData[];
}

export interface TrafficColumn {
  id: string;
  name: string;
  type: 'status' | 'text';
}

export interface TrafficStatus {
  id: string;
  name: string;
  color: string;
}

export const useTrafficData = () => {
  const [groups, setGroups] = useState<TrafficGroup[]>([]);
  const [columns, setColumns] = useState<TrafficColumn[]>([
    { id: 'status', name: 'Status', type: 'status' }
  ]);
  const [statuses, setStatuses] = useState<TrafficStatus[]>([
    { id: 'pending', name: 'Pendente', color: 'bg-yellow-500' },
    { id: 'active', name: 'Ativo', color: 'bg-green-500' },
    { id: 'paused', name: 'Pausado', color: 'bg-red-500' }
  ]);

  useEffect(() => {
    const savedGroups = localStorage.getItem('trafficGroups');
    if (savedGroups) {
      try {
        setGroups(JSON.parse(savedGroups));
      } catch (error) {
        console.error('Erro ao carregar grupos de tráfego:', error);
      }
    }

    const savedColumns = localStorage.getItem('trafficColumns');
    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns));
      } catch (error) {
        console.error('Erro ao carregar colunas de tráfego:', error);
      }
    }

    const savedStatuses = localStorage.getItem('trafficStatuses');
    if (savedStatuses) {
      try {
        setStatuses(JSON.parse(savedStatuses));
      } catch (error) {
        console.error('Erro ao carregar status de tráfego:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('trafficGroups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('trafficColumns', JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('trafficStatuses', JSON.stringify(statuses));
  }, [statuses]);

  const updateGroups = (newGroups: TrafficGroup[]) => {
    setGroups(newGroups);
  };

  const createMonth = (monthName: string) => {
    const newGroup: TrafficGroup = {
      id: `group-${Date.now()}`,
      name: `${monthName} - TRÁFEGO`,
      color: 'bg-orange-100',
      isExpanded: true,
      items: []
    };
    setGroups(prev => [newGroup, ...prev]);
  };

  const updateMonth = (groupId: string, newName: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, name: `${newName} - TRÁFEGO` }
        : group
    ));
  };

  const deleteMonth = (groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const duplicateMonth = async (sourceGroupId: string, newMonthName: string) => {
    const sourceGroup = groups.find(g => g.id === sourceGroupId);
    if (!sourceGroup) return;

    const newGroup: TrafficGroup = {
      id: `group-${Date.now()}`,
      name: `${newMonthName} - TRÁFEGO`,
      color: sourceGroup.color,
      isExpanded: true,
      items: sourceGroup.items.map(item => ({
        ...item,
        id: `traffic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        resultado: 0,
        conversoes: 0,
        roi: 0,
        roas: 0
      }))
    };

    setGroups(prev => [newGroup, ...prev]);
  };

  const addStatus = (status: Omit<TrafficStatus, 'id'>) => {
    const newStatus: TrafficStatus = {
      ...status,
      id: `status-${Date.now()}`
    };
    setStatuses(prev => [...prev, newStatus]);
  };

  const updateStatus = (statusId: string, updates: Partial<TrafficStatus>) => {
    setStatuses(prev => prev.map(status => 
      status.id === statusId ? { ...status, ...updates } : status
    ));
  };

  const deleteStatus = (statusId: string) => {
    setStatuses(prev => prev.filter(status => status.id !== statusId));
  };

  const addColumn = (name: string, type: 'status' | 'text') => {
    const newColumn: TrafficColumn = {
      id: `column-${Date.now()}`,
      name,
      type
    };
    setColumns(prev => [...prev, newColumn]);
  };

  const updateColumn = (columnId: string, updates: Partial<TrafficColumn>) => {
    setColumns(prev => prev.map(column => 
      column.id === columnId ? { ...column, ...updates } : column
    ));
  };

  const deleteColumn = (columnId: string) => {
    setColumns(prev => prev.filter(column => column.id !== columnId));
  };

  const updateItemStatus = (itemId: string, columnId: string, statusId: string) => {
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId 
          ? { ...item, [columnId]: statusId }
          : item
      )
    })));
  };

  const addClient = (groupId: string, clientData: { elemento: string; servicos: string }) => {
    const newClient: TrafficData = {
      id: `traffic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      cliente: clientData.elemento,
      elemento: clientData.elemento,
      servicos: clientData.servicos,
      mes: new Date().toISOString().split('T')[0].slice(0, 7),
      investimento: 0,
      resultado: 0,
      roi: 0,
      roas: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
      conversoes: 0
    };

    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, items: [...group.items, newClient] }
        : group
    ));
  };

  const deleteClient = (clientId: string) => {
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== clientId)
    })));
  };

  const updateClient = (clientId: string, updates: Partial<TrafficData>) => {
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === clientId ? { ...item, ...updates } : item
      )
    })));
  };

  const getClientFiles = (clientId: string): File[] => {
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
