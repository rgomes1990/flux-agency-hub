import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ContentItem {
  id: string;
  elemento: string;
  servicos: string;
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
    { id: 'informacoes', name: 'Informações', type: 'text', isDefault: true }
  ]);

  // Separate state for custom columns only (for management interface)
  const [customColumns, setCustomColumns] = useState<ContentColumn[]>([]);

  const [statuses, setStatuses] = useState<ServiceStatus[]>([]);

  const { logAudit, user } = useAuth();

  // Carregar colunas personalizadas do Supabase
  const loadColumns = async () => {
    try {
      console.log('🔄 CONTENT: Carregando colunas globais');
      const { data, error } = await supabase
        .from('column_config')
        .select('*')
        .eq('module', 'content');

      console.log('📊 CONTENT: Resposta colunas:', { data, error });

      if (error) {
        console.error('❌ CONTENT: Erro ao carregar colunas:', error);
        return;
      }

      if (data && data.length > 0) {
        const customColumnsFromDB = data.map(col => ({
          id: col.column_id,
          name: col.column_name,
          type: col.column_type as 'status' | 'text',
          isDefault: false
        }));

        // Set custom columns for management interface
        setCustomColumns(customColumnsFromDB);
        
        // Set only custom columns for table display (no default columns)
        console.log('✅ CONTENT: Colunas atualizadas:', customColumnsFromDB.length);
        setColumns(customColumnsFromDB);
      } else {
        setCustomColumns([]);
        setColumns([]); // No columns if no custom columns exist
      }
    } catch (error) {
      console.error('❌ CONTENT: Erro crítico ao carregar colunas:', error);
    }
  };

  // Carregar status personalizados do Supabase - APENAS os customizados
  const loadStatuses = async () => {
    try {
      console.log('🔄 CONTENT: Carregando status globais');
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'content');

      console.log('📊 CONTENT: Resposta status:', { data, error });

      if (error) {
        console.error('❌ CONTENT: Erro ao carregar status:', error);
        return;
      }

      if (data && data.length > 0) {
        const customStatuses = data.map(status => ({
          id: status.status_id,
          name: status.status_name,
          color: status.status_color
        }));

        console.log('✅ CONTENT: Status atualizados:', customStatuses.length);
        setStatuses(customStatuses);
      } else {
        console.log('ℹ️ CONTENT: Nenhum status customizado encontrado');
        setStatuses([]);
      }
    } catch (error) {
      console.error('❌ CONTENT: Erro crítico ao carregar status:', error);
    }
  };

  // Carregar dados do Supabase
  const loadContentData = async () => {
    try {
      console.log('🔄 CONTENT: Carregando dados globais');
      
      const { data, error } = await supabase
        .from('content_data')
        .select('*')
        .order('created_at', { ascending: true });

      console.log('📊 CONTENT: Resposta dados:', { 
        dataLength: data?.length || 0, 
        error,
        sampleData: data?.[0] 
      });

      if (error) {
        console.error('❌ CONTENT: Erro ao carregar dados:', error);
        return;
      }

      if (data && data.length > 0) {
        const groupsMap = new Map<string, ContentGroup>();
        const seenItems = new Set<string>(); // Track unique combinations

        data.forEach((item, index) => {
          console.log(`🔍 CONTENT: Processando item ${index + 1}:`, {
            group_id: item.group_id,
            item_data_type: typeof item.item_data,
            item_data_preview: JSON.stringify(item.item_data).substring(0, 100)
          });

          let itemData;
          try {
            if (typeof item.item_data === 'string') {
              itemData = JSON.parse(item.item_data);
            } else {
              itemData = item.item_data;
            }
          } catch (parseError) {
            console.error('❌ CONTENT: Erro ao fazer parse do item_data:', parseError);
            return;
          }
          
          // Create unique key based on actual item ID to detect real duplicates
          const uniqueKey = `${item.group_id}-${itemData?.id}`;
          
          if (seenItems.has(uniqueKey)) {
            console.warn('⚠️ CONTENT: Item duplicado detectado e ignorado:', uniqueKey);
            return;
          }
          
          seenItems.add(uniqueKey);
          
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
          if (itemData) {
            group.items.push(itemData);
          }
        });

        const loadedGroups = Array.from(groupsMap.values());
        console.log('✅ CONTENT: Grupos carregados:', {
          totalGroups: loadedGroups.length,
          groupDetails: loadedGroups.map(g => ({ name: g.name, itemCount: g.items.length }))
        });
        setGroups(loadedGroups);
      } else {
        console.log('ℹ️ CONTENT: Nenhum dado encontrado');
        setGroups([]);
      }
    } catch (error) {
      console.error('❌ CONTENT: Erro crítico ao carregar dados:', error);
    }
  };

  // Salvar dados no Supabase
  const saveContentToDatabase = async (newGroups: ContentGroup[]) => {
    try {
      console.log('🔄 CONTENT: Iniciando salvamento:', {
        groupCount: newGroups.length,
        totalItems: newGroups.reduce((acc, g) => acc + g.items.length, 0)
      });
      
      for (const group of newGroups) {
        console.log(`🔄 CONTENT: Processando grupo: ${group.name} (${group.items.length} itens)`);
        
        // Deletar dados existentes do grupo
        const { error: deleteError } = await supabase
          .from('content_data')
          .delete()
          .eq('group_id', group.id);

        if (deleteError) {
          console.error('❌ CONTENT: Erro ao deletar:', deleteError);
          throw deleteError;
        }

        // Sempre inserir dados do grupo
        const insertData = group.items.length > 0 
          ? group.items.map((item, index) => {
              console.log(`📝 CONTENT: Preparando item ${index + 1}:`, {
                id: item.id,
                elemento: item.elemento,
                hasAttachments: !!item.attachments?.length
              });

              return {
                user_id: null, // Sempre null para tornar global
                group_id: group.id,
                group_name: group.name,
                group_color: group.color,
                is_expanded: group.isExpanded,
                item_data: item
              };
            })
          : [{
              user_id: null, // Sempre null para tornar global
              group_id: group.id,
              group_name: group.name,
              group_color: group.color,
              is_expanded: group.isExpanded,
              item_data: {
                id: `empty-${group.id}`,
                elemento: '',
                servicos: '',
                informacoes: '',
                observacoes: '',
                attachments: []
              }
            }];

        const { data: insertResult, error: insertError } = await supabase
          .from('content_data')
          .insert(insertData)
          .select('id');

        if (insertError) {
          console.error('❌ CONTENT: Erro ao inserir:', insertError);
          throw insertError;
        }

        console.log('✅ CONTENT: Dados inseridos:', insertResult?.length || 0);
      }
      
      console.log('🎉 CONTENT: Salvamento completo!');
    } catch (error) {
      console.error('❌ CONTENT: Erro crítico no salvamento:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      console.log('Inicializando dados de conteúdo globais para usuário:', user.username);
      loadContentData();
      loadColumns();
      loadStatuses();
    } else {
      console.log('Usuário não logado, aguardando autenticação...');
    }
  }, [user]);

  const createMonth = async (monthName: string) => {

    try {
      console.log('🆕 CONTENT: Criando mês:', monthName);
      
      const timestamp = Date.now();
      const newGroup: ContentGroup = {
        id: `${monthName.toLowerCase().replace(/\s+/g, '-')}-conteudo-${timestamp}`,
        name: monthName.toUpperCase() + ' - CONTEÚDO',
        color: 'bg-blue-500',
        isExpanded: true,
        items: []
      };
      
      const newGroups = [...groups, newGroup];
      console.log('📊 CONTENT: Salvando novo grupo:', {
        groupId: newGroup.id,
        totalGroups: newGroups.length
      });
      
      setGroups(newGroups);
      await saveContentToDatabase(newGroups);
      
      console.log('✅ CONTENT: Mês criado com sucesso');
      return newGroup.id;
    } catch (error) {
      console.error('❌ CONTENT: Erro ao criar mês:', error);
      throw error;
    }
  };

  const addClient = async (groupId: string, clientData: Partial<ContentItem>) => {
    try {
      console.log('👤 CONTENT: Adicionando cliente:', {
        groupId,
        elemento: clientData.elemento,
        servicos: clientData.servicos
      });
      
      // Enhanced duplicate check - check both in memory and database
      const targetGroup = groups.find(g => g.id === groupId);
      if (targetGroup) {
        const existingClient = targetGroup.items.find(item => 
          item.elemento === clientData.elemento && 
          item.servicos === clientData.servicos
        );
        
        if (existingClient) {
          console.warn('⚠️ CONTENT: Cliente já existe no estado:', existingClient.id);
          return existingClient.id;
        }
      }

      // Check database for duplicates too
      const { data: existingInDB, error: checkError } = await supabase
        .from('content_data')
        .select('id, item_data')
        .eq('group_id', groupId);

      if (checkError) {
        console.error('❌ CONTENT: Erro ao verificar duplicatas:', checkError);
      } else if (existingInDB) {
        const duplicateInDB = existingInDB.find(record => {
          try {
            const itemData = typeof record.item_data === 'string' 
              ? JSON.parse(record.item_data) 
              : record.item_data;
            return itemData.elemento === clientData.elemento && 
                   itemData.servicos === clientData.servicos;
          } catch {
            return false;
          }
        });

        if (duplicateInDB) {
          console.warn('⚠️ CONTENT: Cliente já existe no banco:', duplicateInDB.id);
          // Reload data to sync with database
          await loadContentData();
          return null;
        }
      }
      
      // Generate unique ID with enhanced entropy
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const randomString2 = Math.random().toString(36).substring(2, 9);
      const randomNum = Math.floor(Math.random() * 10000);
      const clientId = `content-client-${timestamp}-${randomString}-${randomString2}-${randomNum}`;
      
      const newClient: ContentItem = {
        id: clientId,
        elemento: clientData.elemento || 'Novo Cliente',
        servicos: clientData.servicos || '',
        informacoes: '',
        attachments: []
      };

      // Adicionar colunas customizadas
      customColumns.forEach(column => {
        newClient[column.id] = column.type === 'status' ? '' : '';
      });

      const newGroups = groups.map(group => 
        group.id === groupId 
          ? { ...group, items: group.items.filter(item => item.id !== `empty-${groupId}`).concat(newClient) }
          : group
      );
      
      console.log('📊 CONTENT: Salvando cliente no grupo:', {
        clientId: newClient.id,
        groupId,
        totalItemsInGroup: newGroups.find(g => g.id === groupId)?.items.length
      });
      
      setGroups(newGroups);
      await saveContentToDatabase(newGroups);
      
      console.log('✅ CONTENT: Cliente adicionado com sucesso');
      return newClient.id;
    } catch (error) {
      console.error('❌ CONTENT: Erro ao adicionar cliente:', error);
      throw error;
    }
  };

  const addColumn = async (name: string, type: 'status' | 'text') => {

    try {
      console.log('🆕 CONTENT: Adicionando coluna:', { name, type });
      
      const newColumn: ContentColumn = {
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name,
        type,
        isDefault: false
      };
      
      // Salvar no banco
      const { data, error } = await supabase
        .from('column_config')
        .insert({
          column_id: newColumn.id,
          column_name: newColumn.name,
          column_type: newColumn.type,
          module: 'content',
          is_default: false,
          user_id: null // Sempre null para tornar global
        })
        .select();

      console.log('📊 CONTENT: Resultado inserção coluna:', { data, error });

      if (error) {
        console.error('❌ CONTENT: Erro ao salvar coluna:', error);
        throw error;
      }
      
      setColumns(prev => [...prev, newColumn]);
      setCustomColumns(prev => [...prev, newColumn]);
      
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
      
      console.log('✅ CONTENT: Coluna adicionada com sucesso');
    } catch (error) {
      console.error('❌ CONTENT: Erro ao adicionar coluna:', error);
      throw error;
    }
  };

  const addStatus = async (status: ServiceStatus) => {

    try {
      console.log('🆕 CONTENT: Adicionando status:', status);
      
      // Salvar no banco
      const { data, error } = await supabase
        .from('status_config')
        .insert({
          status_id: status.id,
          status_name: status.name,
          status_color: status.color,
          module: 'content',
          user_id: null // Sempre null para tornar global
        })
        .select();

      console.log('📊 CONTENT: Resultado inserção status:', { data, error });

      if (error) {
        console.error('❌ CONTENT: Erro ao salvar status:', error);
        throw error;
      }
      
      setStatuses(prev => [...prev, status]);
      console.log('✅ CONTENT: Status adicionado com sucesso');
    } catch (error) {
      console.error('❌ CONTENT: Erro ao adicionar status:', error);
      throw error;
    }
  };

  const updateStatus = async (statusId: string, updates: Partial<ServiceStatus>) => {

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
        .eq('module', 'content');

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

    try {
      console.log('Deletando status de conteúdo:', { statusId, userId: user.id });
      
      setStatuses(prev => prev.filter(status => status.id !== statusId));

      // Deletar do Supabase
      const { error } = await supabase
        .from('status_config')
        .delete()
        .eq('status_id', statusId)
        .eq('module', 'content');

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

  const updateColumn = async (id: string, updates: Partial<ContentColumn>) => {

    try {
      console.log('Atualizando coluna de conteúdo:', { id, updates, userId: user.id });
      
      setColumns(prev => prev.map(col => 
        col.id === id ? { ...col, ...updates } : col
      ));
      
      setCustomColumns(prev => prev.map(col => 
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

    try {
      console.log('Deletando coluna de conteúdo:', { id, userId: user.id });
      
      setColumns(prev => prev.filter(col => col.id !== id));
      setCustomColumns(prev => prev.filter(col => col.id !== id));
      
      // Deletar do Supabase
      const { error } = await supabase
        .from('column_config')
        .delete()
        .eq('column_id', id)
        .eq('module', 'content');

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
      console.log('📝 Atualizando cliente:', itemId, 'com:', Object.keys(updates));
      
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
      console.log('✅ Cliente atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar cliente:', error);
      throw error;
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
    customColumns, // Export custom columns for management interface
    statuses,
    updateGroups: async (newGroups: ContentGroup[]) => {
      console.log('🔄 CONTENT: Atualizando grupos:', newGroups.length);
      try {
        setGroups(newGroups);
        await saveContentToDatabase(newGroups);
        console.log('✅ CONTENT: Grupos atualizados');
      } catch (error) {
        console.error('❌ CONTENT: Erro ao atualizar grupos:', error);
        throw error;
      }
    },
    createMonth,
    addClient,
    addColumn,
    addStatus,
    updateStatus,
    deleteStatus,
    updateColumn,
    deleteColumn,
    updateItemStatus,
    deleteClient,
    updateClient,
    getClientFiles,
    updateMonth: async (groupId: string, newName: string) => {
      try {
        const newGroups = groups.map(group => 
          group.id === groupId 
            ? { ...group, name: newName.toUpperCase() + ' - CONTEÚDO' }
            : group
        );
        setGroups(newGroups);
        await saveContentToDatabase(newGroups);
      } catch (error) {
        console.error('❌ CONTENT: Erro ao atualizar mês:', error);
        throw error;
      }
    },
    deleteMonth: async (groupId: string) => {
      try {
        const { error } = await supabase
          .from('content_data')
          .delete()
          .eq('group_id', groupId);

        if (error) throw error;
        setGroups(groups.filter(group => group.id !== groupId));
      } catch (error) {
        console.error('❌ CONTENT: Erro ao deletar mês:', error);
        throw error;
      }
    },
    duplicateMonth: async (sourceGroupId: string, newMonthName: string) => {
      try {
        const groupToDuplicate = groups.find(g => g.id === sourceGroupId);
        if (!groupToDuplicate) throw new Error('Grupo não encontrado');
        
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
            informacoes: '',
            observacoes: '',
            attachments: []
          }))
        };
        
        const newGroups = [...groups, newGroup];
        setGroups(newGroups);
        await saveContentToDatabase(newGroups);
        return newGroupId;
      } catch (error) {
        console.error('❌ CONTENT: Erro ao duplicar mês:', error);
        throw error;
      }
    }
  };
};
