import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDataProtection } from './useDataProtection';

export interface ContentItem {
  id: string;
  elemento: string;
  servicos: string;
  observacoes: string;
  hasAttachments?: boolean;
  attachments?: any[];
  status?: {
    id?: string;
    name?: string;
    color?: string;
  };
  [key: string]: any;
}

export interface ContentGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: ContentItem[];
}

export interface ContentColumn {
  id: string;
  name: string;
  type: 'status' | 'text';
}

export interface ContentStatus {
  id: string;
  name: string;
  color: string;
}

export function useContentData() {
  const [groups, setGroups] = useState<ContentGroup[]>([]);
  const [columns, setColumns] = useState<ContentColumn[]>([]);
  const [customColumns, setCustomColumns] = useState<ContentColumn[]>([]);
  const [statuses, setStatuses] = useState<ContentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { safeDataOperation } = useDataProtection();

  useEffect(() => {
    loadContentData();
    loadColumns();
    loadStatuses();
  }, []);

  const updateGroups = (updatedGroups: ContentGroup[]) => {
    setGroups(updatedGroups);
  };

  // Função otimizada para carregar dados sem duplicação
  const loadContentData = useCallback(async () => {
    console.log('🔄 CONTENT: Carregando dados...');
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('content_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ CONTENT: Erro ao carregar dados:', error);
        throw error;
      }

      console.log('📊 CONTENT: Dados carregados:', data?.length, 'registros');

      if (!data || data.length === 0) {
        console.log('📝 CONTENT: Criando dados padrão...');
        await createDefaultData();
        return;
      }

      // Usar Map para garantir unicidade por ID
      const itemsMap = new Map<string, any>();
      const groupsMap = new Map<string, ContentGroup>();

      // Primeiro, processar todos os itens únicos
      data.forEach(item => {
        if (!itemsMap.has(item.id)) {
          itemsMap.set(item.id, item);
        }
      });

      console.log('🔍 CONTENT: Itens únicos encontrados:', itemsMap.size);

      // Agora processar os itens únicos
      itemsMap.forEach(item => {
        // Criar ou obter grupo
        if (!groupsMap.has(item.group_id)) {
          groupsMap.set(item.group_id, {
            id: item.group_id,
            name: item.group_name,
            color: item.group_color || 'bg-blue-500',
            isExpanded: true,
            items: []
          });
        }

        const group = groupsMap.get(item.group_id)!;
        
        // Verificar se tem anexos
        const hasAttachments = item.attachments && 
          ((Array.isArray(item.attachments) && item.attachments.length > 0) || 
           (typeof item.attachments === 'string' && item.attachments.trim() !== ''));

        // Processar item_data para extrair status corretamente
        let itemData: any = {};
        let status: any = null;
        
        if (item.item_data) {
          try {
            if (typeof item.item_data === 'string') {
              itemData = JSON.parse(item.item_data);
            } else {
              itemData = item.item_data;
            }
            
            // Extrair status do item_data
            if (itemData.status) {
              status = itemData.status;
              console.log('✅ CONTENT: Status encontrado para item:', item.elemento, status);
            }
          } catch (error) {
            console.warn('⚠️ CONTENT: Erro ao processar item_data:', error);
            itemData = {};
          }
        }

        const contentItem: ContentItem = {
          id: item.id,
          elemento: item.elemento || '',
          servicos: item.servicos || '',
          observacoes: item.observacoes || '',
          hasAttachments: !!hasAttachments,
          status: status,
          ...itemData // Incluir outros dados do item_data
        };

        console.log('📝 CONTENT: Item processado:', {
          elemento: contentItem.elemento,
          status: contentItem.status,
          hasAttachments: contentItem.hasAttachments
        });

        // Verificar se o item já existe no grupo antes de adicionar
        const existingItemIndex = group.items.findIndex(existingItem => existingItem.id === contentItem.id);
        if (existingItemIndex === -1) {
          group.items.push(contentItem);
        } else {
          console.log('⚠️ CONTENT: Item já existe no grupo, ignorando duplicata:', contentItem.id);
        }
      });

      const loadedGroups = Array.from(groupsMap.values());
      console.log('✅ CONTENT: Grupos carregados:', loadedGroups.length);
      
      // Log dos itens por grupo
      loadedGroups.forEach(group => {
        console.log(`📋 CONTENT: Grupo ${group.name} tem ${group.items.length} itens`);
        // Log dos IDs dos itens para verificar duplicação
        const itemIds = group.items.map(item => item.id);
        const uniqueIds = [...new Set(itemIds)];
        if (itemIds.length !== uniqueIds.length) {
          console.warn('⚠️ CONTENT: Duplicatas detectadas no grupo', group.name, {
            total: itemIds.length,
            únicos: uniqueIds.length
          });
        }
      });
      
      updateGroups(loadedGroups);

    } catch (error) {
      console.error('❌ CONTENT: Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadClientAttachments = useCallback(async (clientId: string) => {
    console.log('📎 CONTENT: Carregando anexos do cliente:', clientId);
    
    try {
      const { data, error } = await supabase
        .from('content_data')
        .select('attachments')
        .eq('id', clientId)
        .single();

      if (error) {
        console.error('❌ CONTENT: Erro ao carregar anexos:', error);
        return [];
      }

      if (!data?.attachments) {
        return [];
      }

      let attachments = [];
      try {
        if (Array.isArray(data.attachments)) {
          attachments = data.attachments.map((att: any) => {
            if (typeof att === 'string') {
              const parsed = JSON.parse(att);
              return {
                name: parsed.name || 'Arquivo',
                type: parsed.type || 'application/octet-stream',
                data: parsed.data || '',
                size: parsed.size || 0
              };
            }
            return {
              name: att.name || 'Arquivo',
              type: att.type || 'application/octet-stream',
              data: att.data || '',
              size: att.size || 0
            };
          });
        } else if (typeof data.attachments === 'string') {
          const parsed = JSON.parse(data.attachments);
          if (Array.isArray(parsed)) {
            attachments = parsed;
          }
        }
      } catch (error) {
        console.warn('⚠️ CONTENT: Erro ao processar anexos:', error);
      }

      console.log('✅ CONTENT: Anexos carregados:', attachments.length);
      return attachments;
    } catch (error) {
      console.error('❌ CONTENT: Erro ao carregar anexos:', error);
      return [];
    }
  }, []);

  const getClientFiles = useCallback((clientId: string) => {
    const client = groups.flatMap(g => g.items).find(item => item.id === clientId);
    if (client?.attachments) {
      return Array.isArray(client.attachments) ? client.attachments : [];
    }
    return [];
  }, [groups]);

  const createMonth = async (monthName: string) => {
    console.log('🔄 CONTENT: Criando novo mês:', monthName);
    
    try {
      const newGroupId = crypto.randomUUID();
      const newGroup: ContentGroup = {
        id: newGroupId,
        name: `${monthName} - CONTEÚDO`,
        color: 'bg-blue-500',
        isExpanded: true,
        items: []
      };

      // Primeiro inserir no banco de dados
      const { error: insertError } = await supabase
        .from('content_data')
        .insert({
          id: crypto.randomUUID(),
          group_id: newGroupId,
          group_name: newGroup.name,
          group_color: newGroup.color,
          elemento: '',
          servicos: '',
          observacoes: '',
          attachments: null,
          item_data: { status: null },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ CONTENT: Erro ao inserir grupo no banco:', insertError);
        throw insertError;
      }

      // Depois atualizar o estado local
      const updatedGroups = [...groups, newGroup];
      setGroups(updatedGroups);
      
      console.log('✅ CONTENT: Mês criado com sucesso:', monthName);
    } catch (error) {
      console.error('❌ CONTENT: Erro ao criar mês:', error);
      throw error;
    }
  };

  const updateMonth = async (groupId: string, newMonthName: string) => {
    console.log('🔄 CONTENT: Atualizando mês:', groupId, 'para:', newMonthName);
    
    try {
      const newGroupName = `${newMonthName} - CONTEÚDO`;
      
      // Primeiro atualizar no banco de dados
      const { error: updateError } = await supabase
        .from('content_data')
        .update({ 
          group_name: newGroupName,
          updated_at: new Date().toISOString()
        })
        .eq('group_id', groupId);

      if (updateError) {
        console.error('❌ CONTENT: Erro ao atualizar grupo no banco:', updateError);
        throw updateError;
      }

      // Depois atualizar o estado local
      const updatedGroups = groups.map(group =>
        group.id === groupId ? { ...group, name: newGroupName } : group
      );

      setGroups(updatedGroups);
      
      console.log('✅ CONTENT: Mês atualizado com sucesso');
    } catch (error) {
      console.error('❌ CONTENT: Erro ao atualizar mês:', error);
      throw error;
    }
  };

  const deleteMonth = async (groupId: string) => {
    console.log('🔄 CONTENT: Deletando mês:', groupId);
    
    try {
      // Deletar todos os itens do grupo no banco
      const { error: deleteError } = await supabase
        .from('content_data')
        .delete()
        .eq('group_id', groupId);

      if (deleteError) {
        console.error('❌ CONTENT: Erro ao deletar grupo no banco:', deleteError);
        throw deleteError;
      }

      // Depois atualizar o estado local
      const updatedGroups = groups.filter(group => group.id !== groupId);
      setGroups(updatedGroups);
      
      console.log('✅ CONTENT: Mês deletado com sucesso');
    } catch (error) {
      console.error('❌ CONTENT: Erro ao deletar mês:', error);
      throw error;
    }
  };

  const duplicateMonth = async (groupId: string, newMonthName: string) => {
    console.log('🔄 CONTENT: Duplicando mês:', groupId, 'para:', newMonthName);
    
    try {
      const groupToDuplicate = groups.find(group => group.id === groupId);
      if (!groupToDuplicate) {
        console.error('❌ CONTENT: Grupo não encontrado para duplicar:', groupId);
        return;
      }
    
      const newGroupId = crypto.randomUUID();
      const newGroupName = `${newMonthName} - CONTEÚDO`;
      
      // Preparar dados para inserção no banco
      const itemsToInsert = groupToDuplicate.items.length > 0 
        ? groupToDuplicate.items.map(item => ({
            id: crypto.randomUUID(),
            group_id: newGroupId,
            group_name: newGroupName,
            group_color: groupToDuplicate.color,
            elemento: item.elemento || '',
            servicos: item.servicos || '',
            observacoes: item.observacoes || '',
            attachments: item.attachments || null,
            item_data: { status: item.status || null, ...item },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        : [{
            id: crypto.randomUUID(),
            group_id: newGroupId,
            group_name: newGroupName,
            group_color: groupToDuplicate.color,
            elemento: '',
            servicos: '',
            observacoes: '',
            attachments: null,
            item_data: { status: null },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }];

      // Inserir no banco de dados
      const { error: insertError } = await supabase
        .from('content_data')
        .insert(itemsToInsert);

      if (insertError) {
        console.error('❌ CONTENT: Erro ao inserir grupo duplicado no banco:', insertError);
        throw insertError;
      }

      // Depois atualizar o estado local
      const duplicatedGroup: ContentGroup = {
        id: newGroupId,
        name: newGroupName,
        color: groupToDuplicate.color,
        isExpanded: true,
        items: groupToDuplicate.items.map(item => ({
          ...item,
          id: crypto.randomUUID()
        }))
      };
    
      const updatedGroups = [...groups, duplicatedGroup];
      setGroups(updatedGroups);
      
      console.log('✅ CONTENT: Mês duplicado com sucesso');
    } catch (error) {
      console.error('❌ CONTENT: Erro ao duplicar mês:', error);
      throw error;
    }
  };

  const addStatus = async (status: ContentStatus) => {
    setStatuses([...statuses, status]);
    await saveStatusesToDatabase([...statuses, status]);
  };

  const updateStatus = async (statusId: string, updates: { name: string; color: string }) => {
    const updatedStatuses = statuses.map(status =>
      status.id === statusId ? { ...status, ...updates } : status
    );

    setStatuses(updatedStatuses);
    await saveStatusesToDatabase(updatedStatuses);
  };

  const deleteStatus = async (statusId: string) => {
    const updatedStatuses = statuses.filter(status => status.id !== statusId);
    setStatuses(updatedStatuses);
    await saveStatusesToDatabase(updatedStatuses);
  };

  const addColumn = async (columnName: string, columnType: 'status' | 'text') => {
    const newColumn = {
      id: crypto.randomUUID(),
      name: columnName,
      type: columnType
    };

    setCustomColumns([...customColumns, newColumn]);
    await saveColumnsToDatabase([...customColumns, newColumn]);
  };

  const updateColumn = async (updatedColumn: ContentColumn) => {
    const updatedColumns = customColumns.map(column =>
      column.id === updatedColumn.id ? updatedColumn : column
    );

    setCustomColumns(updatedColumns);
    await saveColumnsToDatabase(updatedColumns);
  };

  const deleteColumn = async (columnId: string) => {
    const updatedColumns = customColumns.filter(column => column.id !== columnId);
    setCustomColumns(updatedColumns);
    await saveColumnsToDatabase(updatedColumns);
  };

  const moveColumnUp = async (columnId: string) => {
    const columnIndex = customColumns.findIndex(column => column.id === columnId);
    if (columnIndex <= 0) return;

    const newColumns = [...customColumns];
    const temp = newColumns[columnIndex];
    newColumns[columnIndex] = newColumns[columnIndex - 1];
    newColumns[columnIndex - 1] = temp;

    setCustomColumns(newColumns);
    await saveColumnsToDatabase(newColumns);
  };

  const moveColumnDown = async (columnId: string) => {
    const columnIndex = customColumns.findIndex(column => column.id === columnId);
    if (columnIndex >= customColumns.length - 1) return;

    const newColumns = [...customColumns];
    const temp = newColumns[columnIndex];
    newColumns[columnIndex] = newColumns[columnIndex + 1];
    newColumns[columnIndex + 1] = temp;

    setCustomColumns(newColumns);
    await saveColumnsToDatabase(newColumns);
  };

  const updateItemStatus = async (itemId: string, status: any) => {
    console.log('🔄 CONTENT: Atualizando status do item:', itemId, status);
    
    try {
      // Primeiro atualizar no banco de dados
      const { error: updateError } = await supabase
        .from('content_data')
        .update({ 
          item_data: { status: status },
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (updateError) {
        console.error('❌ CONTENT: Erro ao atualizar status no banco:', updateError);
        throw updateError;
      }

      // Depois atualizar o estado local
      const updatedGroups = groups.map(group => ({
        ...group,
        items: group.items.map(item => {
          if (item.id === itemId) {
            const updatedItem = { ...item, status: status };
            console.log('✅ CONTENT: Item atualizado com status:', updatedItem);
            return updatedItem;
          }
          return item;
        })
      }));

      setGroups(updatedGroups);
    } catch (error) {
      console.error('❌ CONTENT: Erro ao atualizar status:', error);
      throw error;
    }
  };

  const addClient = async (groupId: string, client: Omit<ContentItem, 'id'>) => {
    try {
      const newClientId = crypto.randomUUID();
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Grupo não encontrado');
      }

      const newClient: ContentItem = {
        id: newClientId,
        elemento: client.elemento || '',
        servicos: client.servicos || '',
        observacoes: client.observacoes || '',
        hasAttachments: false,
        ...client
      };

      // Primeiro inserir no banco de dados
      const { error: insertError } = await supabase
        .from('content_data')
        .insert({
          id: newClientId,
          group_id: groupId,
          group_name: group.name,
          group_color: group.color,
          elemento: newClient.elemento,
          servicos: newClient.servicos,
          observacoes: newClient.observacoes,
          attachments: null,
          item_data: { status: null },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ CONTENT: Erro ao inserir cliente no banco:', insertError);
        throw insertError;
      }

      // Depois atualizar o estado local
      const updatedGroups = groups.map(group =>
        group.id === groupId ? { ...group, items: [...group.items, newClient] } : group
      );

      setGroups(updatedGroups);
      return newClient;
    } catch (error) {
      console.error('❌ CONTENT: Erro ao adicionar cliente:', error);
      throw error;
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      // Primeiro deletar do banco de dados
      const { error: deleteError } = await supabase
        .from('content_data')
        .delete()
        .eq('id', clientId);

      if (deleteError) {
        console.error('❌ CONTENT: Erro ao deletar cliente no banco:', deleteError);
        throw deleteError;
      }

      // Depois atualizar o estado local
      const updatedGroups = groups.map(group => ({
        ...group,
        items: group.items.filter(item => item.id !== clientId)
      }));

      setGroups(updatedGroups);
      return clientId;
    } catch (error) {
      console.error('❌ CONTENT: Erro ao deletar cliente:', error);
      throw error;
    }
  };

  const updateClient = async (clientId: string, updates: any) => {
    try {
      // Preparar dados para atualização
      const { hasAttachments, status, ...otherUpdates } = updates;
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Atualizar campos específicos
      if (otherUpdates.elemento !== undefined) updateData.elemento = otherUpdates.elemento;
      if (otherUpdates.servicos !== undefined) updateData.servicos = otherUpdates.servicos;
      if (otherUpdates.observacoes !== undefined) updateData.observacoes = otherUpdates.observacoes;
      if (otherUpdates.attachments !== undefined) updateData.attachments = otherUpdates.attachments;
      
      // Atualizar item_data com status e outros dados
      if (status !== undefined || Object.keys(otherUpdates).length > 0) {
        const currentItem = groups.flatMap(g => g.items).find(item => item.id === clientId);
        const currentItemData = currentItem ? { status: currentItem.status, ...currentItem } : {};
        updateData.item_data = { 
          ...currentItemData,
          status: status !== undefined ? status : currentItemData.status,
          ...otherUpdates
        };
      }

      // Primeiro atualizar no banco de dados
      const { error: updateError } = await supabase
        .from('content_data')
        .update(updateData)
        .eq('id', clientId);

      if (updateError) {
        console.error('❌ CONTENT: Erro ao atualizar cliente no banco:', updateError);
        throw updateError;
      }

      // Depois atualizar o estado local
      const updatedGroups = groups.map(group => ({
        ...group,
        items: group.items.map(item => {
          if (item.id === clientId) {
            return { ...item, ...updates };
          }
          return item;
        })
      }));

      setGroups(updatedGroups);
      return updates;
    } catch (error) {
      console.error('❌ CONTENT: Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const saveContentToDatabase = async (contentData: ContentGroup[]) => {
    console.log('💾 CONTENT: Função saveContentToDatabase chamada - usando operações individuais');
    // Esta função agora é principalmente para compatibilidade
    // As operações individuais já salvam diretamente no banco
  };

  const createDefaultData = async () => {
    console.log('📝 CONTENT: Criando dados padrão...');
    
    const defaultGroups = [
      { name: 'Janeiro - CONTEÚDO', color: 'bg-blue-500' },
      { name: 'Fevereiro - CONTEÚDO', color: 'bg-green-500' },
      { name: 'Março - CONTEÚDO', color: 'bg-red-500' }
    ];

    try {
      const groupsToInsert = defaultGroups.map(group => ({
        id: crypto.randomUUID(),
        group_id: crypto.randomUUID(),
        group_name: group.name,
        group_color: group.color,
        elemento: '',
        servicos: '',
        observacoes: '',
        attachments: null,
        item_data: { status: null },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('content_data')
        .insert(groupsToInsert);

      if (insertError) {
        console.error('❌ CONTENT: Erro ao criar dados padrão:', insertError);
        throw insertError;
      }

      // Recarregar dados
      await loadContentData();
    } catch (error) {
      console.error('❌ CONTENT: Erro ao criar dados padrão:', error);
      throw error;
    }
  };

  const loadColumns = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'content')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ CONTENT: Erro ao carregar colunas:', error);
        return;
      }

      if (data) {
        const typedColumns = data.map(col => ({
          id: col.status_id,
          name: col.status_name,
          type: 'status' as const
        }));
        setColumns(typedColumns);
        setCustomColumns(typedColumns);
      }
    } catch (error) {
      console.error('❌ CONTENT: Erro ao carregar colunas:', error);
    }
  }, []);

  const loadStatuses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'content')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ CONTENT: Erro ao carregar status:', error);
        return;
      }

      if (data) {
        const typedStatuses = data.map(status => ({
          id: status.status_id,
          name: status.status_name,
          color: status.status_color
        }));
        console.log('✅ CONTENT: Status carregados:', typedStatuses.length);
        setStatuses(typedStatuses);
      }
    } catch (error) {
      console.error('❌ CONTENT: Erro ao carregar status:', error);
    }
  }, []);

  const saveColumnsToDatabase = async (columns: ContentColumn[]) => {
    console.log('💾 CONTENT: Salvando colunas no banco de dados...', columns);

    try {
      const { error: deleteError } = await supabase
        .from('status_config')
        .delete()
        .eq('module', 'content');

      if (deleteError) {
        console.error('❌ CONTENT: Erro ao limpar colunas antigas:', deleteError);
        throw deleteError;
      }

      const formattedColumns = columns.map(column => ({
        status_id: column.id,
        status_name: column.name,
        status_color: '#3b82f6',
        module: 'content'
      }));

      if (formattedColumns.length > 0) {
        const { error: insertError } = await supabase
          .from('status_config')
          .insert(formattedColumns);

        if (insertError) {
          console.error('❌ CONTENT: Erro ao inserir colunas:', insertError);
          throw insertError;
        }
      }

      console.log('✅ CONTENT: Colunas salvas com sucesso!');
    } catch (error) {
      console.error('❌ CONTENT: Erro ao salvar colunas no banco de dados:', error);
    }
  };

  const saveStatusesToDatabase = async (statuses: ContentStatus[]) => {
    console.log('💾 CONTENT: Salvando status no banco de dados...', statuses);

    try {
      const { error: deleteError } = await supabase
        .from('status_config')
        .delete()
        .eq('module', 'content');

      if (deleteError) {
        console.error('❌ CONTENT: Erro ao limpar status antigos:', deleteError);
        throw deleteError;
      }

      const formattedStatuses = statuses.map(status => ({
        status_id: status.id,
        status_name: status.name,
        status_color: status.color,
        module: 'content'
      }));

      if (formattedStatuses.length > 0) {
        const { error: insertError } = await supabase
          .from('status_config')
          .insert(formattedStatuses);

        if (insertError) {
          console.error('❌ CONTENT: Erro ao inserir status:', insertError);
          throw insertError;
        }
      }

      console.log('✅ CONTENT: Status salvos com sucesso!');
    } catch (error) {
      console.error('❌ CONTENT: Erro ao salvar status no banco de dados:', error);
    }
  };

  return {
    groups,
    columns,
    customColumns,
    statuses,
    loading,
    updateGroups,
    loadClientAttachments,
    getClientFiles,
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
    moveColumnUp,
    moveColumnDown,
    updateItemStatus,
    addClient,
    deleteClient,
    updateClient
  };
}
