import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

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
  attachments?: { name: string; data: string; type: string }[];
  [key: string]: any;
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

  const { logAudit } = useAuth();

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

  const duplicateMonth = async (sourceGroupId: string, newMonthName: string) => {
    try {
      console.log('Iniciando duplicação de mês de tráfego:', { sourceGroupId, newMonthName });
      
      const groupToDuplicate = groups.find(g => g.id === sourceGroupId);
      if (!groupToDuplicate) {
        console.error('Grupo não encontrado para duplicação:', sourceGroupId);
        return null;
      }
      
      const timestamp = Date.now();
      const newGroupId = `${newMonthName.toLowerCase().replace(/\s+/g, '-')}-trafego-${timestamp}`;
      
      const newGroup: TrafficGroup = {
        id: newGroupId,
        name: newMonthName.toUpperCase() + ' - TRÁFEGO',
        color: groupToDuplicate.color,
        isExpanded: true,
        items: groupToDuplicate.items.map((item, index) => ({
          ...item,
          id: `traffic-${newMonthName.toLowerCase()}-${timestamp}-${index}`,
          configuracao_campanha: '', criacao_anuncios: '', aprovacao_cliente: '',
          ativacao: '', monitoramento: '', otimizacao: '', relatorio: '',
          informacoes: '', observacoes: '', attachments: []
        }))
      };
      
      console.log('Novo grupo criado:', newGroup);
      
      setGroups(prev => {
        const updated = [...prev, newGroup];
        console.log('Grupos atualizados:', updated.length);
        return updated;
      });
      
      // Registrar na auditoria
      await logAudit('traffic', newGroupId, 'INSERT', null, { 
        month_name: newMonthName,
        duplicated_from: sourceGroupId 
      });
      
      return newGroupId;
    } catch (error) {
      console.error('Erro ao duplicar mês de tráfego:', error);
      return null;
    }
  };

  const updateGroups = (newGroups: TrafficGroup[]) => {
    setGroups(newGroups);
  };

  const createMonth = async (monthName: string) => {
    const newGroup: TrafficGroup = {
      id: monthName.toLowerCase().replace(/\s+/g, '-') + '-trafego',
      name: monthName.toUpperCase() + ' - TRÁFEGO',
      color: 'bg-red-500',
      isExpanded: true,
      items: []
    };
    
    setGroups(prev => [...prev, newGroup]);
    
    // Registrar na auditoria
    await logAudit('traffic', newGroup.id, 'INSERT', null, { month_name: monthName });
    
    return newGroup.id;
  };

  const updateMonth = async (groupId: string, newName: string) => {
    const oldGroup = groups.find(g => g.id === groupId);
    
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, name: newName.toUpperCase() + ' - TRÁFEGO' }
        : group
    ));
    
    // Registrar na auditoria
    await logAudit('traffic', groupId, 'UPDATE', 
      { name: oldGroup?.name }, 
      { name: newName.toUpperCase() + ' - TRÁFEGO' }
    );
  };

  const deleteMonth = async (groupId: string) => {
    const groupToDelete = groups.find(g => g.id === groupId);
    
    setGroups(prev => prev.filter(group => group.id !== groupId));
    
    // Registrar na auditoria
    await logAudit('traffic', groupId, 'DELETE', { name: groupToDelete?.name }, null);
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
    setColumns(prev => prev.filter(col => col.id !== id));
    
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => {
        const updatedItem = { ...item };
        delete updatedItem[id];
        return updatedItem;
      })
    })));
  };

  const updateItemStatus = async (itemId: string, field: string, statusId: string) => {
    const oldItem = groups.flatMap(g => g.items).find(item => item.id === itemId);
    
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId 
          ? { ...item, [field]: statusId }
          : item
      )
    })));
    
    // Registrar na auditoria
    await logAudit('traffic', itemId, 'UPDATE', 
      { [field]: oldItem?.[field] }, 
      { [field]: statusId }
    );
  };

  const addClient = async (groupId: string, clientData: Partial<TrafficItem>) => {
    const newClient: TrafficItem = {
      id: `traffic-client-${Date.now()}`,
      elemento: clientData.elemento || 'Novo Cliente',
      servicos: clientData.servicos || '',
      configuracao_campanha: '', criacao_anuncios: '', aprovacao_cliente: '',
      ativacao: '', monitoramento: '', otimizacao: '', relatorio: '',
      informacoes: '', attachments: []
    };

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
    
    // Registrar na auditoria
    await logAudit('traffic', newClient.id, 'INSERT', null, {
      elemento: clientData.elemento,
      group_id: groupId
    });

    return newClient.id;
  };

  const deleteClient = async (itemId: string) => {
    const clientToDelete = groups.flatMap(g => g.items).find(item => item.id === itemId);
    
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== itemId)
    })));
    
    // Registrar na auditoria
    await logAudit('traffic', itemId, 'DELETE', { elemento: clientToDelete?.elemento }, null);
  };

  const updateClient = async (itemId: string, updates: Partial<TrafficItem>) => {
    const oldClient = groups.flatMap(g => g.items).find(item => item.id === itemId);
    
    if (updates.attachments && updates.attachments.length > 0) {
      const firstAttachment = updates.attachments[0];
      if (firstAttachment instanceof File) {
        const reader = new FileReader();
        reader.onload = () => {
          const serializedFile = {
            name: firstAttachment.name,
            data: reader.result as string,
            type: firstAttachment.type
          };
          updates.attachments = [serializedFile as any];
          
          setGroups(prev => prev.map(group => ({
            ...group,
            items: group.items.map(item => 
              item.id === itemId 
                ? { ...item, ...updates }
                : item
            )
          })));
        };
        reader.readAsDataURL(firstAttachment);
        return;
      }
    }

    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId 
          ? { ...item, ...updates }
          : item
      )
    })));
    
    // Registrar na auditoria
    await logAudit('traffic', itemId, 'UPDATE', 
      { elemento: oldClient?.elemento }, 
      { elemento: updates.elemento }
    );
  };

  const getClientFiles = (clientId: string): File[] => {
    const client = groups.flatMap(g => g.items).find(item => item.id === clientId);
    if (!client?.attachments) return [];
    
    return client.attachments.map(attachment => {
      if ('data' in attachment && 'name' in attachment && 'type' in attachment) {
        const byteCharacters = atob(attachment.data.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new File([byteArray], attachment.name, { type: attachment.type });
      }
      return attachment as File;
    });
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
