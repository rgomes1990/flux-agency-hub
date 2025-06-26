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
    if (!user?.id) {
      console.log('Usuário não encontrado para carregar colunas');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('column_config')
        .select('*')
        .eq('module', 'content')
        .eq('user_id', user.id);

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

        const defaultColumns = columns.filter(col => col.isDefault);
        setColumns([...defaultColumns, ...customColumns.filter(col => !col.isDefault)]);
      }
    } catch (error) {
      console.error('Erro ao carregar colunas:', error);
    }
  };

  // Carregar status personalizados do Supabase
  const loadStatuses = async () => {
    if (!user?.id) {
      console.log('Usuário não encontrado para carregar status');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'content')
        .eq('user_id', user.id);

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
          const defaultStatuses = prev.slice(0, 5);
          return [...defaultStatuses, ...customStatuses];
        });
      }
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    }
  };

  // Carregar dados do Supabase
  const loadContentData = async () => {
    if (!user?.id) {
      console.log('Usuário não encontrado para carregar dados');
      return;
    }
    
    try {
      console.log('Carregando dados de conteúdo para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('content_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar dados de conteúdo:', error);
        return;
      }

      console.log('Dados de conteúdo carregados:', data);

      if (data && data.length > 0) {
        const groupsMap = new Map<string, ContentGroup>();

        data.forEach(item => {
          // Corrigir parsing do item_data
          let itemData;
          try {
            if (typeof item.item_data === 'string') {
              // Se é uma string, fazer parse uma vez
              itemData = JSON.parse(item.item_data);
              // Se ainda for string após o primeiro parse, fazer parse novamente
              if (typeof itemData === 'string') {
                itemData = JSON.parse(itemData);
              }
            } else {
              // Se já é objeto, usar diretamente
              itemData = item.item_data;
            }
          } catch (parseError) {
            console.error('Erro ao fazer parse do item_data:', parseError, item.item_data);
            return; // Pular este item se não conseguir fazer parse
          }
          
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
      }
    } catch (error) {
      console.error('Erro ao carregar dados de conteúdo:', error);
    }
  };

  // Salvar dados no Supabase - CORRIGIDO
  const saveContentToDatabase = async (newGroups: ContentGroup[]) => {
    if (!user?.id) {
      console.error('Usuário não encontrado para salvar dados');
      return;
    }
    
    try {
      console.log('Salvando dados de conteúdo para usuário:', user.id);
      
      for (const group of newGroups) {
        // Deletar dados existentes do grupo
        const { error: deleteError } = await supabase
          .from('content_data')
          .delete()
          .eq('group_id', group.id)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Erro ao limpar dados do grupo:', deleteError);
        }

        // Inserir dados atualizados do grupo
        if (group.items.length > 0) {
          const insertData = group.items.map(item => ({
            user_id: user.id,
            group_id: group.id,
            group_name: group.name,
            group_color: group.color,
            is_expanded: group.isExpanded,
            // CORREÇÃO: Garantir que item_data seja um objeto válido, não string dupla
            item_data: item // Passar diretamente o objeto, o Supabase fará o JSON automaticamente
          }));

          console.log('Dados para inserir:', insertData);

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
    if (user?.id) {
      console.log('Usuário logado, inicializando dados de conteúdo:', user.id);
      loadContentData();
      loadColumns();
      loadStatuses();
    }
  }, [user?.id]);

  const duplicateMonth = async (sourceGroupId: string, newMonthName: string) => {
    if (!user?.id) {
      console.error('Usuário não encontrado para duplicar mês');
      return;
    }

    try {
      console.log('Iniciando duplicação de mês de conteúdo:', { sourceGroupId, newMonthName, userId: user.id });
      
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
      
      console.log('Mês de conteúdo duplicado com sucesso');
      return newGroupId;
    } catch (error) {
      console.error('Erro ao duplicar mês de conteúdo:', error);
      throw error;
    }
  };

  const updateGroups = async (newGroups: ContentGroup[]) => {
    console.log('Atualizando grupos de conteúdo:', newGroups);
    setGroups(newGroups);
    await saveContentToDatabase(newGroups);
  };

  const createMonth = async (monthName: string) => {
    if (!user?.id) {
      console.error('Usuário não encontrado para criar mês');
      return;
    }

    try {
      console.log('Criando novo mês de conteúdo:', { monthName, userId: user.id });
      
      const timestamp = Date.now();
      const newGroup: ContentGroup = {
        id: `${monthName.toLowerCase().replace(/\s+/g, '-')}-conteudo-${timestamp}`,
        name: monthName.toUpperCase() + ' - CONTEÚDO',
        color: 'bg-blue-500',
        isExpanded: true,
        items: []
      };
      
      const newGroups = [...groups, newGroup];
      setGroups(newGroups);
      await saveContentToDatabase(newGroups);
      
      console.log('Mês criado com sucesso:', newGroup.id);
      return newGroup.id;
    } catch (error) {
      console.error('Erro ao criar mês:', error);
      throw error;
    }
  };

  const updateMonth = async (groupId: string, newName: string) => {
    if (!user?.id) {
      console.error('Usuário não encontrado para atualizar mês');
      return;
    }

    try {
      const newGroups = groups.map(group => 
        group.id === groupId 
          ? { ...group, name: newName.toUpperCase() + ' - CONTEÚDO' }
          : group
      );
      
      setGroups(newGroups);
      await saveContentToDatabase(newGroups);
    } catch (error) {
      console.error('Erro ao atualizar mês:', error);
      throw error;
    }
  };

  const deleteMonth = async (groupId: string) => {
    if (!user?.id) {
      console.error('Usuário não encontrado para deletar mês');
      return;
    }

    try {
      // Deletar do banco de dados
      const { error } = await supabase
        .from('content_data')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar mês do banco:', error);
        throw error;
      }

      const newGroups = groups.filter(group => group.id !== groupId);
      setGroups(newGroups);
    } catch (error) {
      console.error('Erro ao deletar mês:', error);
      throw error;
    }
  };

  const addStatus = async (status: ServiceStatus) => {
    if (!user?.id) {
      console.error('Usuário não encontrado para adicionar status');
      return;
    }

    try {
      console.log('Adicionando status de conteúdo:', { status, userId: user.id });
      
      setStatuses(prev => [...prev, status]);
      
      // Salvar no Supabase
      const { error } = await supabase
        .from('status_config')
        .insert({
          status_id: status.id,
          status_name: status.name,
          status_color: status.color,
          module: 'content',
          user_id: user.id
        });

      if (error) {
        console.error('Erro ao salvar status:', error);
        setStatuses(prev => prev.filter(s => s.id !== status.id));
        throw error;
      }
      
      console.log('Status adicionado com sucesso');
    } catch (error) {
      console.error('Erro ao adicionar status:', error);
      throw error;
    }
  };

  const updateStatus = async (statusId: string, updates: Partial<ServiceStatus>) => {
    if (!user?.id) {
      console.error('Usuário não encontrado para atualizar status');
      return;
    }

    try {
      console.log('Atualizando status de conteúdo:', { statusId, updates, userId: user.id });
      
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
        .eq('module', 'content')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        loadStatuses();
        throw error;
      }
      
      console.log('Status atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  };

  const deleteStatus = async (statusId: string) => {
    if (!user?.id) {
      console.error('Usuário não encontrado para deletar status');
      return;
    }

    try {
      console.log('Deletando status de conteúdo:', { statusId, userId: user.id });
      
      setStatuses(prev => prev.filter(status => status.id !== statusId));

      // Deletar do Supabase
      const { error } = await supabase
        .from('status_config')
        .delete()
        .eq('status_id', statusId)
        .eq('module', 'content')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar status:', error);
        loadStatuses();
        throw error;
      }
      
      console.log('Status deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar status:', error);
      throw error;
    }
  };

  const addColumn = async (name: string, type: 'status' | 'text') => {
    if (!user?.id) {
      console.error('Usuário não encontrado para adicionar coluna');
      return;
    }

    try {
      console.log('Adicionando coluna de conteúdo:', { name, type, userId: user.id });
      
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
          user_id: user.id
        });

      if (error) {
        console.error('Erro ao salvar coluna:', error);
        setColumns(prev => prev.filter(col => col.id !== newColumn.id));
        throw error;
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
      
      console.log('Coluna adicionada com sucesso');
    } catch (error) {
      console.error('Erro ao adicionar coluna:', error);
      throw error;
    }
  };

  const updateColumn = async (id: string, updates: Partial<ContentColumn>) => {
    if (!user?.id) {
      console.error('Usuário não encontrado para atualizar coluna');
      return;
    }

    try {
      console.log('Atualizando coluna de conteúdo:', { id, updates, userId: user.id });
      
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
        .eq('module', 'content')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar coluna:', error);
        loadColumns();
        throw error;
      }
      
      console.log('Coluna atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar coluna:', error);
      throw error;
    }
  };

  const deleteColumn = async (id: string) => {
    if (!user?.id) {
      console.error('Usuário não encontrado para deletar coluna');
      return;
    }

    try {
      console.log('Deletando coluna de conteúdo:', { id, userId: user.id });
      
      setColumns(prev => prev.filter(col => col.id !== id));
      
      // Deletar do Supabase
      const { error } = await supabase
        .from('column_config')
        .delete()
        .eq('column_id', id)
        .eq('module', 'content')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar coluna:', error);
        loadColumns();
        throw error;
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
      
      console.log('Coluna deletada com sucesso');
    } catch (error) {
      console.error('Erro ao deletar coluna:', error);
      throw error;
    }
  };

  const updateItemStatus = async (itemId: string, field: string, statusId: string) => {
    try {
      console.log('Atualizando status do item:', { itemId, field, statusId });
      
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
      
      console.log('Status do item atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status do item:', error);
    }
  };

  const addClient = async (groupId: string, clientData: Partial<ContentItem>) => {
    if (!user?.id) {
      console.error('Usuário não encontrado para adicionar cliente');
      return;
    }

    try {
      console.log('Adicionando cliente de conteúdo:', { groupId, clientData, userId: user.id });
      
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

      console.log('Cliente adicionado com sucesso:', newClient.id);
      return newClient.id;
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
  };

  const deleteClient = async (itemId: string) => {
    try {
      console.log('Deletando cliente:', itemId);
      
      const newGroups = groups.map(group => ({
        ...group,
        items: group.items.filter(item => item.id !== itemId)
      }));
      
      setGroups(newGroups);
      await saveContentToDatabase(newGroups);
      
      console.log('Cliente deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
    }
  };

  const updateClient = async (itemId: string, updates: Partial<ContentItem>) => {
    try {
      console.log('Atualizando cliente:', { itemId, updates });
      
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
      
      console.log('Cliente atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
    }
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
