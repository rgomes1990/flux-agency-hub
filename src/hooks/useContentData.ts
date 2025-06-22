import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface ContentItem {
  id: string;
  elemento: string;
  servicos: string;
  janeiro: string;
  fevereiro: string;
  marco: string;
  abril: string;
  maio: string;
  junho: string;
  julho: string;
  agosto: string;
  setembro: string;
  outubro: string;
  novembro: string;
  dezembro: string;
  informacoes: string;
  observacoes?: string;
  attachments?: { name: string; data: string; type: string }[];
  [key: string]: any;
}

interface ContentGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: ContentItem[];
}

interface ContentColumn {
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

export const useContentData = () => {
  const [groups, setGroups] = useState<ContentGroup[]>([
    {
      id: 'janeiro-conteudo',
      name: 'JANEIRO - CONTEÚDO',
      color: 'bg-blue-500',
      isExpanded: true,
      items: []
    }
  ]);

  const [columns, setColumns] = useState<ContentColumn[]>([
    { id: 'janeiro', name: 'Janeiro', type: 'status', isDefault: true },
    { id: 'fevereiro', name: 'Fevereiro', type: 'status', isDefault: true },
    { id: 'marco', name: 'Março', type: 'status', isDefault: true },
    { id: 'abril', name: 'Abril', type: 'status', isDefault: true },
    { id: 'maio', name: 'Maio', type: 'status', isDefault: true },
    { id: 'junho', name: 'Junho', type: 'status', isDefault: true },
    { id: 'julho', name: 'Julho', type: 'status', isDefault: true },
    { id: 'agosto', name: 'Agosto', type: 'status', isDefault: true },
    { id: 'setembro', name: 'Setembro', type: 'status', isDefault: true },
    { id: 'outubro', name: 'Outubro', type: 'status', isDefault: true },
    { id: 'novembro', name: 'Novembro', type: 'status', isDefault: true },
    { id: 'dezembro', name: 'Dezembro', type: 'status', isDefault: true },
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
    const savedData = localStorage.getItem('contentData');
    const savedColumns = localStorage.getItem('contentColumns');
    const savedStatuses = localStorage.getItem('contentStatuses');
    
    if (savedData) {
      try {
        setGroups(JSON.parse(savedData));
      } catch (error) {
        console.error('Erro ao carregar dados do conteúdo:', error);
      }
    }
    
    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns));
      } catch (error) {
        console.error('Erro ao carregar colunas do conteúdo:', error);
      }
    }
    
    if (savedStatuses) {
      try {
        setStatuses(JSON.parse(savedStatuses));
      } catch (error) {
        console.error('Erro ao carregar status do conteúdo:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('contentData', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('contentColumns', JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('contentStatuses', JSON.stringify(statuses));
  }, [statuses]);

  const duplicateMonth = async (sourceGroupId: string, newMonthName: string) => {
    try {
      console.log('Iniciando duplicação de mês de conteúdo:', { sourceGroupId, newMonthName });
      
      const groupToDuplicate = groups.find(g => g.id === sourceGroupId);
      if (!groupToDuplicate) {
        console.error('Grupo não encontrado para duplicação:', sourceGroupId);
        return null;
      }
      
      const timestamp = Date.now();
      const newGroupId = `${newMonthName.toLowerCase().replace(/\s+/g, '-')}-conteudo-${timestamp}`;
      
      const newGroup: ContentGroup = {
        id: newGroupId,
        name: newMonthName.toUpperCase() + ' - CONTEÚDO',
        color: groupToDuplicate.color,
        isExpanded: true,
        items: groupToDuplicate.items.map((item, index) => ({
          ...item,
          id: `content-${newMonthName.toLowerCase()}-${timestamp}-${index}`,
          janeiro: '', fevereiro: '', marco: '', abril: '', maio: '', junho: '',
          julho: '', agosto: '', setembro: '', outubro: '', novembro: '', dezembro: '',
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
      await logAudit('content', newGroupId, 'INSERT', null, { 
        month_name: newMonthName,
        duplicated_from: sourceGroupId 
      });
      
      return newGroupId;
    } catch (error) {
      console.error('Erro ao duplicar mês de conteúdo:', error);
      return null;
    }
  };

  const updateGroups = (newGroups: ContentGroup[]) => {
    setGroups(newGroups);
  };

  const createMonth = async (monthName: string) => {
    const newGroup: ContentGroup = {
      id: monthName.toLowerCase().replace(/\s+/g, '-') + '-conteudo',
      name: monthName.toUpperCase() + ' - CONTEÚDO',
      color: 'bg-blue-500',
      isExpanded: true,
      items: []
    };
    
    setGroups(prev => [...prev, newGroup]);
    
    // Registrar na auditoria
    await logAudit('content', newGroup.id, 'INSERT', null, { month_name: monthName });
    
    return newGroup.id;
  };

  const updateMonth = async (groupId: string, newName: string) => {
    const oldGroup = groups.find(g => g.id === groupId);
    
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, name: newName.toUpperCase() + ' - CONTEÚDO' }
        : group
    ));
    
    // Registrar na auditoria
    await logAudit('content', groupId, 'UPDATE', 
      { name: oldGroup?.name }, 
      { name: newName.toUpperCase() + ' - CONTEÚDO' }
    );
  };

  const deleteMonth = async (groupId: string) => {
    const groupToDelete = groups.find(g => g.id === groupId);
    
    setGroups(prev => prev.filter(group => group.id !== groupId));
    
    // Registrar na auditoria
    await logAudit('content', groupId, 'DELETE', { name: groupToDelete?.name }, null);
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
    const newColumn: ContentColumn = {
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

  const updateColumn = (id: string, updates: Partial<ContentColumn>) => {
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
    await logAudit('content', itemId, 'UPDATE', 
      { [field]: oldItem?.[field] }, 
      { [field]: statusId }
    );
  };

  const addClient = async (groupId: string, clientData: Partial<ContentItem>) => {
    const newClient: ContentItem = {
      id: `content-client-${Date.now()}`,
      elemento: clientData.elemento || 'Novo Cliente',
      servicos: clientData.servicos || '',
      janeiro: '', fevereiro: '', marco: '', abril: '', maio: '', junho: '',
      julho: '', agosto: '', setembro: '', outubro: '', novembro: '', dezembro: '',
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
    await logAudit('content', newClient.id, 'INSERT', null, {
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
    await logAudit('content', itemId, 'DELETE', { elemento: clientToDelete?.elemento }, null);
  };

  const updateClient = async (itemId: string, updates: Partial<ContentItem>) => {
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
    await logAudit('content', itemId, 'UPDATE', 
      { elemento: oldClient?.elemento }, 
      { elemento: updates.elemento }
    );
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
    updateClient
  };
};
