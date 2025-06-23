import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

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
  const [groups, setGroups] = useState<ContentGroup[]>([]);
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

  const { logAudit, user } = useAuth();

  // Carregar colunas personalizadas do Supabase
  const loadColumns = async () => {
    try {
      const { data, error } = await supabase
        .from('column_config')
        .select('*')
        .eq('module', 'content');

      if (error) {
        console.error('Erro ao carregar colunas:', error);
        return;
      }

      if (data && data.length > 0) {
        const customColumns = data.map(col => ({
          id: col.column_id,
          name: col.column_name,
          type: col.column_type as 'status' | 'text',
          isDefault: col.is_default || false
        }));

        // Combinar colunas padrão com personalizadas
        const defaultColumns = columns.filter(col => col.isDefault);
        setColumns([...defaultColumns, ...customColumns.filter(col => !col.isDefault)]);
      }
    } catch (error) {
      console.error('Erro ao carregar colunas:', error);
    }
  };

  // Carregar status personalizados do Supabase
  const loadStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'content');

      if (error) {
        console.error('Erro ao carregar status:', error);
        return;
      }

      if (data && data.length > 0) {
        const customStatuses = data.map(status => ({
          id: status.status_id,
          name: status.status_name,
          color: status.status_color
        }));

        setStatuses(prev => {
          const defaultStatuses = prev.slice(0, 5); // Manter os 5 primeiros padrões
          return [...defaultStatuses, ...customStatuses];
        });
      }
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    }
  };

  // Carregar dados do Supabase
  const loadContentData = async () => {
    try {
      console.log('Carregando dados de conteúdo...');
      
      const { data, error } = await supabase
        .from('content_data')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar dados de conteúdo:', error);
        return;
      }

      console.log('Dados de conteúdo carregados:', data);

      if (data && data.length > 0) {
        const groupsMap = new Map<string, ContentGroup>();

        data.forEach(item => {
          const itemData = typeof item.item_data === 'string' ? JSON.parse(item.item_data) : item.item_data;
          
          if (!groupsMap.has(item.group_id)) {
            groupsMap.set(item.group_id, {
              id: item.group_id,
              name: item.group_name,
              color: item.group_color || 'bg-blue-500',
              isExpanded: item.is_expanded,
              items: []
            });
          }

          const group = groupsMap.get(item.group_id)!;
          group.items.push(itemData);
        });

        setGroups(Array.from(groupsMap.values()));
      } else {
        // Se não há dados, criar grupo padrão
        setGroups([{
          id: 'janeiro-conteudo',
          name: 'JANEIRO - CONTEÚDO',
          color: 'bg-blue-500',
          isExpanded: true,
          items: []
        }]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de conteúdo:', error);
    }
  };

  // Salvar dados no Supabase - CORRIGIDO: não deletar todos os dados
  const saveContentToDatabase = async (newGroups: ContentGroup[]) => {
    try {
      console.log('Salvando dados de conteúdo...', newGroups);
      
      // Primeiro, buscar dados existentes para comparar
      const { data: existingData } = await supabase
        .from('content_data')
        .select('group_id, item_data');

      const existingGroupIds = new Set(existingData?.map(item => item.group_id) || []);
      
      // Inserir apenas grupos novos ou atualizados
      for (const group of newGroups) {
        // Deletar apenas dados deste grupo específico
        const { error: deleteError } = await supabase
          .from('content_data')
          .delete()
          .eq('group_id', group.id);

        if (deleteError) {
          console.error('Erro ao limpar dados do grupo:', deleteError);
        }

        // Inserir dados atualizados do grupo
        const insertData = [];
        for (const item of group.items) {
          insertData.push({
            user_id: user?.id || null,
            group_id: group.id,
            group_name: group.name,
            group_color: group.color,
            is_expanded: group.isExpanded,
            item_data: JSON.stringify(item)
          });
        }

        if (insertData.length > 0) {
          const { error } = await supabase
            .from('content_data')
            .insert(insertData);

          if (error) {
            console.error('Erro ao salvar dados do grupo:', error);
            throw error;
          }
        }
      }
      
      console.log('Dados de conteúdo salvos com sucesso');
    } catch (error) {
      console.error('Erro ao salvar dados de conteúdo:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadContentData();
    loadColumns();
    loadStatuses();
  }, []);

  const duplicateMonth = async (sourceGroupId: string, newMonthName: string) => {
    try {
      console.log('Iniciando duplicação de mês de conteúdo:', { sourceGroupId, newMonthName });
      
      const groupToDuplicate = groups.find(g => g.id === sourceGroupId);
      if (!groupToDuplicate) {
        console.error('Grupo não encontrado para duplicação:', sourceGroupId);
        throw new Error('Grupo não encontrado');
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
      
      const newGroups = [...groups, newGroup];
      setGroups(newGroups);
      await saveContentToDatabase(newGroups);
      
      // Registrar na auditoria
      await logAudit('content', newGroupId, 'INSERT', null, { 
        month_name: newMonthName,
        duplicated_from: sourceGroupId 
      });
      
      return newGroupId;
    } catch (error) {
      console.error('Erro ao duplicar mês de conteúdo:', error);
      throw error;
    }
  };

  const updateGroups = async (newGroups: ContentGroup[]) => {
    setGroups(newGroups);
    await saveContentToDatabase(newGroups);
  };

  const createMonth = async (monthName: string) => {
    try {
      const newGroup: ContentGroup = {
        id: monthName.toLowerCase().replace(/\s+/g, '-') + '-conteudo',
        name: monthName.toUpperCase() + ' - CONTEÚDO',
        color: 'bg-blue-500',
        isExpanded: true,
        items: []
      };
      
      const newGroups = [...groups, newGroup];
      setGroups(newGroups);
      await saveContentToDatabase(newGroups);
      
      // Registrar na auditoria
      await logAudit('content', newGroup.id, 'INSERT', null, { month_name: monthName });
      
      return newGroup.id;
    } catch (error) {
      console.error('Erro ao criar mês:', error);
      throw error;
    }
  };

  const updateMonth = async (groupId: string, newName: string) => {
    const oldGroup = groups.find(g => g.id === groupId);
    
    const newGroups = groups.map(group => 
      group.id === groupId 
        ? { ...group, name: newName.toUpperCase() + ' - CONTEÚDO' }
        : group
    );
    
    setGroups(newGroups);
    await saveContentToDatabase(newGroups);
    
    // Registrar na auditoria
    await logAudit('content', groupId, 'UPDATE', 
      { name: oldGroup?.name }, 
      { name: newName.toUpperCase() + ' - CONTEÚDO' }
    );
  };

  const deleteMonth = async (groupId: string) => {
    const groupToDelete = groups.find(g => g.id === groupId);
    
    const newGroups = groups.filter(group => group.id !== groupId);
    setGroups(newGroups);
    await saveContentToDatabase(newGroups);
    
    // Registrar na auditoria
    await logAudit('content', groupId, 'DELETE', { name: groupToDelete?.name }, null);
  };

  const addStatus = async (status: ServiceStatus) => {
    try {
      setStatuses(prev => [...prev, status]);
      
      // Salvar no Supabase
      const { error } = await supabase
        .from('status_config')
        .insert({
          status_id: status.id,
          status_name: status.name,
          status_color: status.color,
          module: 'content',
          user_id: user?.id
        });

      if (error) {
        console.error('Erro ao salvar status:', error);
        // Reverter mudança local se falhar
        setStatuses(prev => prev.filter(s => s.id !== status.id));
      }
    } catch (error) {
      console.error('Erro ao adicionar status:', error);
    }
  };

  const updateStatus = async (statusId: string, updates: Partial<ServiceStatus>) => {
    try {
      setStatuses(prev => prev.map(status => 
        status.id === statusId ? { ...status, ...updates } : status
      ));

      // Atualizar no Supabase
      const { error } = await supabase
        .from('status_config')
        .update({
          status_name: updates.name,
          status_color: updates.color
        })
        .eq('status_id', statusId)
        .eq('module', 'content');

      if (error) {
        console.error('Erro ao atualizar status:', error);
        // Recarregar do banco se falhar
        loadStatuses();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const deleteStatus = async (statusId: string) => {
    try {
      setStatuses(prev => prev.filter(status => status.id !== statusId));

      // Deletar do Supabase
      const { error } = await supabase
        .from('status_config')
        .delete()
        .eq('status_id', statusId)
        .eq('module', 'content');

      if (error) {
        console.error('Erro ao deletar status:', error);
        // Recarregar do banco se falhar
        loadStatuses();
      }
    } catch (error) {
      console.error('Erro ao deletar status:', error);
    }
  };

  const addColumn = async (name: string, type: 'status' | 'text') => {
    try {
      const newColumn: ContentColumn = {
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name,
        type,
        isDefault: false
      };
      
      setColumns(prev => [...prev, newColumn]);
      
      // Salvar no Supabase
      const { error } = await supabase
        .from('column_config')
        .insert({
          column_id: newColumn.id,
          column_name: newColumn.name,
          column_type: newColumn.type,
          module: 'content',
          is_default: false,
          user_id: user?.id
        });

      if (error) {
        console.error('Erro ao salvar coluna:', error);
        // Reverter mudança local se falhar
        setColumns(prev => prev.filter(col => col.id !== newColumn.id));
        return;
      }
      
      // Adicionar a nova coluna a todos os itens existentes
      const newGroups = groups.map(group => ({
        ...group,
        items: group.items.map(item => ({
          ...item,
          [newColumn.id]: type === 'status' ? '' : ''
        }))
      }));
      
      setGroups(newGroups);
      await saveContentToDatabase(newGroups);
    } catch (error) {
      console.error('Erro ao adicionar coluna:', error);
    }
  };

  const updateColumn = async (id: string, updates: Partial<ContentColumn>) => {
    try {
      setColumns(prev => prev.map(col => 
        col.id === id ? { ...col, ...updates } : col
      ));

      // Atualizar no Supabase
      const { error } = await supabase
        .from('column_config')
        .update({
          column_name: updates.name,
          column_type: updates.type
        })
        .eq('column_id', id)
        .eq('module', 'content');

      if (error) {
        console.error('Erro ao atualizar coluna:', error);
        // Recarregar do banco se falhar
        loadColumns();
      }
    } catch (error) {
      console.error('Erro ao atualizar coluna:', error);
    }
  };

  const deleteColumn = async (id: string) => {
    try {
      setColumns(prev => prev.filter(col => col.id !== id));
      
      // Deletar do Supabase
      const { error } = await supabase
        .from('column_config')
        .delete()
        .eq('column_id', id)
        .eq('module', 'content');

      if (error) {
        console.error('Erro ao deletar coluna:', error);
        // Recarregar do banco se falhar
        loadColumns();
        return;
      }
      
      const newGroups = groups.map(group => ({
        ...group,
        items: group.items.map(item => {
          const updatedItem = { ...item };
          delete updatedItem[id];
          return updatedItem;
        })
      }));
      
      setGroups(newGroups);
      await saveContentToDatabase(newGroups);
    } catch (error) {
      console.error('Erro ao deletar coluna:', error);
    }
  };

  const updateItemStatus = async (itemId: string, field: string, statusId: string) => {
    const oldItem = groups.flatMap(g => g.items).find(item => item.id === itemId);
    
    const newGroups = groups.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId 
          ? { ...item, [field]: statusId }
          : item
      )
    }));
    
    setGroups(newGroups);
    await saveContentToDatabase(newGroups);
    
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

    const newGroups = groups.map(group => 
      group.id === groupId 
        ? { ...group, items: [...group.items, newClient] }
        : group
    );
    
    setGroups(newGroups);
    await saveContentToDatabase(newGroups);
    
    // Registrar na auditoria
    await logAudit('content', newClient.id, 'INSERT', null, {
      elemento: clientData.elemento,
      group_id: groupId
    });

    return newClient.id;
  };

  const deleteClient = async (itemId: string) => {
    const clientToDelete = groups.flatMap(g => g.items).find(item => item.id === itemId);
    
    const newGroups = groups.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== itemId)
    }));
    
    setGroups(newGroups);
    await saveContentToDatabase(newGroups);
    
    // Registrar na auditoria
    await logAudit('content', itemId, 'DELETE', { elemento: clientToDelete?.elemento }, null);
  };

  const updateClient = async (itemId: string, updates: Partial<ContentItem>) => {
    const oldClient = groups.flatMap(g => g.items).find(item => item.id === itemId);
    
    if (updates.attachments && updates.attachments.length > 0) {
      const firstAttachment = updates.attachments[0];
      if (firstAttachment instanceof File) {
        const reader = new FileReader();
        reader.onload = async () => {
          const serializedFile = {
            name: firstAttachment.name,
            data: reader.result as string,
            type: firstAttachment.type
          };
          updates.attachments = [serializedFile as any];
          
          const newGroups = groups.map(group => ({
            ...group,
            items: group.items.map(item => 
              item.id === itemId 
                ? { ...item, ...updates }
                : item
            )
          }));
          
          setGroups(newGroups);
          await saveContentToDatabase(newGroups);
        };
        reader.readAsDataURL(firstAttachment);
        return;
      }
    }

    const newGroups = groups.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId 
          ? { ...item, ...updates }
          : item
      )
    }));
    
    setGroups(newGroups);
    await saveContentToDatabase(newGroups);
    
    // Registrar na auditoria
    await logAudit('content', itemId, 'UPDATE', 
      { elemento: oldClient?.elemento }, 
      { elemento: updates.elemento }
    );
  };

  const getClientFiles = (clientId: string): File[] => {
    const client = groups.flatMap(g => g.items).find(item => item.id === clientId);
    if (!client || !client.attachments) return [];
    
    return client.attachments.map(attachment => {
      const byteCharacters = atob(attachment.data.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new File([byteArray], attachment.name, { type: attachment.type });
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
