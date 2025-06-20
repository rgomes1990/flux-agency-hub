
import { useState, useEffect } from 'react';

interface TrafficItem {
  id: string;
  elemento: string;
  servicos: string;
  configuracao_campanha: string;
  criacao_anuncios: string;
  aprovacao_cliente: string;
  ativacao: string;
  monitoramento: string;
  otimizacao: string;
  relatorio: string;
  informacoes: string;
  observacoes?: string;
}

interface TrafficGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: TrafficItem[];
}

interface TrafficColumn {
  id: string;
  name: string;
  type: 'status' | 'text';
}

interface ServiceStatus {
  id: string;
  name: string;
  color: string;
}

export const useTrafficData = () => {
  const [groups, setGroups] = useState<TrafficGroup[]>([
    {
      id: 'janeiro-trafego',
      name: 'JANEIRO - TRÁFEGO',
      color: 'bg-red-500',
      isExpanded: true,
      items: []
    }
  ]);

  const [columns, setColumns] = useState<TrafficColumn[]>([
    { id: 'configuracao_campanha', name: 'Configuração Campanha', type: 'status' },
    { id: 'criacao_anuncios', name: 'Criação Anúncios', type: 'status' },
    { id: 'aprovacao_cliente', name: 'Aprovação Cliente', type: 'status' },
    { id: 'ativacao', name: 'Ativação', type: 'status' },
    { id: 'monitoramento', name: 'Monitoramento', type: 'status' },
    { id: 'otimizacao', name: 'Otimização', type: 'status' },
    { id: 'relatorio', name: 'Relatório', type: 'status' },
    { id: 'informacoes', name: 'Informações', type: 'text' }
  ]);

  const [statuses, setStatuses] = useState<ServiceStatus[]>([
    { id: 'aprovados', name: 'Aprovados', color: 'bg-green-500' },
    { id: 'feito', name: 'Feito', color: 'bg-blue-500' },
    { id: 'parado', name: 'Parado', color: 'bg-red-500' },
    { id: 'em-andamento', name: 'Em Andamento', color: 'bg-yellow-500' },
    { id: 'revisao', name: 'Em Revisão', color: 'bg-purple-500' }
  ]);

  useEffect(() => {
    const savedData = localStorage.getItem('trafficData');
    const savedColumns = localStorage.getItem('trafficColumns');
    const savedStatuses = localStorage.getItem('trafficStatuses');
    
    if (savedData) {
      try {
        setGroups(JSON.parse(savedData));
      } catch (error) {
        console.error('Erro ao carregar dados do tráfego:', error);
      }
    }
    
    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns));
      } catch (error) {
        console.error('Erro ao carregar colunas do tráfego:', error);
      }
    }
    
    if (savedStatuses) {
      try {
        setStatuses(JSON.parse(savedStatuses));
      } catch (error) {
        console.error('Erro ao carregar status do tráfego:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('trafficData', JSON.stringify(groups));
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
      id: monthName.toLowerCase().replace(/\s+/g, '-') + '-trafego',
      name: monthName.toUpperCase() + ' - TRÁFEGO',
      color: 'bg-red-500',
      isExpanded: true,
      items: []
    };
    
    setGroups(prev => [...prev, newGroup]);
    return newGroup.id;
  };

  const duplicateMonth = (sourceGroupId: string, newMonthName: string) => {
    const groupToDuplicate = groups.find(g => g.id === sourceGroupId);
    if (!groupToDuplicate) return null;
    
    const newGroup: TrafficGroup = {
      id: newMonthName.toLowerCase().replace(/\s+/g, '-') + '-trafego',
      name: newMonthName.toUpperCase() + ' - TRÁFEGO',
      color: groupToDuplicate.color,
      isExpanded: true,
      items: groupToDuplicate.items.map(item => ({
        ...item,
        id: `${item.id}-${Date.now()}-${Math.random()}`
      }))
    };
    
    setGroups(prev => [...prev, newGroup]);
    return newGroup.id;
  };

  const addStatus = (status: ServiceStatus) => {
    setStatuses(prev => [...prev, status]);
  };

  const addColumn = (name: string, type: 'status' | 'text') => {
    const newColumn: TrafficColumn = {
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      type
    };
    setColumns(prev => [...prev, newColumn]);
  };

  const updateColumn = (id: string, updates: Partial<TrafficColumn>) => {
    setColumns(prev => prev.map(col => 
      col.id === id ? { ...col, ...updates } : col
    ));
  };

  const deleteColumn = (id: string) => {
    setColumns(prev => prev.filter(col => col.id !== id));
  };

  const updateItemStatus = (itemId: string, field: string, statusId: string) => {
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId 
          ? { ...item, [field]: statusId }
          : item
      )
    })));
  };

  const addClient = (groupId: string, clientData: Partial<TrafficItem>) => {
    const newClient: TrafficItem = {
      id: `traffic-client-${Date.now()}`,
      elemento: clientData.elemento || 'Novo Cliente',
      servicos: clientData.servicos || '',
      configuracao_campanha: '',
      criacao_anuncios: '',
      aprovacao_cliente: '',
      ativacao: '',
      monitoramento: '',
      otimizacao: '',
      relatorio: '',
      informacoes: ''
    };

    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, items: [...group.items, newClient] }
        : group
    ));

    return newClient.id;
  };

  const deleteClient = (itemId: string) => {
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== itemId)
    })));
  };

  const updateClient = (itemId: string, updates: Partial<TrafficItem>) => {
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId 
          ? { ...item, ...updates }
          : item
      )
    })));
  };

  return {
    groups,
    columns,
    statuses,
    updateGroups,
    createMonth,
    duplicateMonth,
    addStatus,
    addColumn,
    updateColumn,
    deleteColumn,
    updateItemStatus,
    addClient,
    deleteClient,
    updateClient
  };
};
