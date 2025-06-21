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
  attachments?: File[];
  [key: string]: any; // Para colunas dinâmicas
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
  isDefault?: boolean;
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
    { id: 'configuracao_campanha', name: 'Configuração Campanha', type: 'status', isDefault: true },
    { id: 'criacao_anuncios', name: 'Criação Anúncios', type: 'status', isDefault: true },
    { id: 'aprovacao_cliente', name: 'Aprovação Cliente', type: 'status', isDefault: true },
    { id: 'ativacao', name: 'Ativação', type: 'status', isDefault: true },
    { id: 'monitoramento', name: 'Monitoramento', type: 'status', isDefault: true },
    { id: 'otimizacao', name: 'Otimização', type: 'status', isDefault: true },
    { id: 'relatorio', name: 'Relatório', type: 'status', isDefault: true },
    { id: 'informacoes', name: 'Informações', type: 'text', isDefault: true }
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
        id: `${item.id}-${Date.now()}-${Math.random()}`,
        // Reset campos para novo mês
        observacoes: '',
        attachments: []
      }))
    };
    
    setGroups(prev => [...prev, newGroup]);
    
    // Refresh automático após duplicar
    setTimeout(() => {
      window.location.reload();
    }, 500);
    
    return newGroup.id;
  };

  const addStatus = (status: ServiceStatus) => {
    setStatuses(prev => [...prev, status]);
  };

  const updateStatus = (statusId: string, updates: Partial<ServiceStatus>) => {
    setStatuses(prev => prev.map(status => 
      status.id === statusId ? { ...status, ...updates } : status
    ));
  };

  const deleteStatus = (statusId: string) => {
    setStatuses(prev => prev.filter(status => status.id !== statusId));
  };

  const addColumn = (name: string, type: 'status' | 'text') => {
    const newColumn: TrafficColumn = {
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      type,
      isDefault: false
    };
    setColumns(prev => [...prev, newColumn]);
    
    // Adicionar a nova coluna a todos os itens existentes
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => ({
        ...item,
        [newColumn.id]: type === 'status' ? '' : ''
      }))
    })));
  };

  const updateColumn = (id: string, updates: Partial<TrafficColumn>) => {
    setColumns(prev => prev.map(col => 
      col.id === id ? { ...col, ...updates } : col
    ));
  };

  const deleteColumn = (id: string) => {
    // Allow deletion of any column, including default ones
    setColumns(prev => prev.filter(col => col.id !== id));
    
    // Remover a coluna de todos os itens existentes mantendo a tipagem correta
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => {
        const updatedItem = { ...item };
        delete updatedItem[id];
        return updatedItem;
      })
    })));
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
      informacoes: '',
      attachments: []
    };

    // Adicionar campos das colunas personalizadas
    columns.forEach(column => {
      if (!column.isDefault) {
        newClient[column.id] = column.type === 'status' ? '' : '';
      }
    });

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
    updateStatus,
    deleteStatus,
    addColumn,
    updateColumn,
    deleteColumn,
    updateItemStatus,
    addClient,
    deleteClient,
    updateClient
  };
};
