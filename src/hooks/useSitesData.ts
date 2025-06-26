import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SiteItem {
  id: string;
  elemento: string;
  servicos: string;
  informacoes: string;
  observacoes?: string;
  attachments?: { name: string; data: string; type: string; size: number }[];
  [key: string]: any;
}

interface SiteGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: SiteItem[];
}

interface SiteColumn {
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

export const useSitesData = () => {
  const [groups, setGroups] = useState<SiteGroup[]>([]);
  const [columns, setColumns] = useState<SiteColumn[]>([]);
  const [customColumns, setCustomColumns] = useState<SiteColumn[]>([]);
  const [statuses, setStatuses] = useState<ServiceStatus[]>([]);

  const { logAudit, user } = useAuth();

  const loadColumns = async () => {
    if (!user?.id) {
      console.log('❌ SITES: Usuário não encontrado para carregar colunas');
      return;
    }
    
    try {
      console.log('🔄 SITES: Carregando colunas para usuário:', user.id);
      const { data, error } = await supabase
        .from('column_config')
        .select('*')
        .eq('module', 'sites')
        .eq('user_id', user.id);

      console.log('📊 SITES: Resposta colunas:', { data, error });

      if (error) {
        console.error('❌ SITES: Erro ao carregar colunas:', error);
        return;
      }

      if (data && data.length > 0) {
        const customColumnsFromDB = data.map(col => ({
          id: col.column_id,
          name: col.column_name,
          type: col.column_type as 'status' | 'text',
          isDefault: false
        }));

        setCustomColumns(customColumnsFromDB);
        console.log('✅ SITES: Colunas atualizadas:', customColumnsFromDB.length);
        setColumns(customColumnsFromDB);
      } else {
        setCustomColumns([]);
        setColumns([]);
      }
    } catch (error) {
      console.error('❌ SITES: Erro crítico ao carregar colunas:', error);
    }
  };

  const loadStatuses = async () => {
    if (!user?.id) {
      console.log('❌ SITES: Usuário não encontrado para carregar status');
      return;
    }
    
    try {
      console.log('🔄 SITES: Carregando status para usuário:', user.id);
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'sites')
        .eq('user_id', user.id);

      console.log('📊 SITES: Resposta status:', { data, error });

      if (error) {
        console.error('❌ SITES: Erro ao carregar status:', error);
        return;
      }

      if (data && data.length > 0) {
        const customStatuses = data.map(status => ({
          id: status.status_id,
          name: status.status_name,
          color: status.status_color
        }));

        console.log('✅ SITES: Status atualizados:', customStatuses.length);
        setStatuses(customStatuses);
      } else {
        console.log('ℹ️ SITES: Nenhum status customizado encontrado');
        setStatuses([]);
      }
    } catch (error) {
      console.error('❌ SITES: Erro crítico ao carregar status:', error);
    }
  };

  const loadSitesData = async () => {
    if (!user?.id) {
      console.log('❌ SITES: Usuário não encontrado para carregar dados');
      return;
    }
    
    try {
      console.log('🔄 SITES: Carregando dados para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('sites_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      console.log('📊 SITES: Resposta dados:', { 
        dataLength: data?.length || 0, 
        error,
        sampleData: data?.[0] 
      });

      if (error) {
        console.error('❌ SITES: Erro ao carregar dados:', error);
        return;
      }

      if (data && data.length > 0) {
        const groupsMap = new Map<string, SiteGroup>();

        data.forEach((item, index) => {
          console.log(`🔍 SITES: Processando item ${index + 1}:`, {
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
            console.error('❌ SITES: Erro ao fazer parse do item_data:', parseError);
            return;
          }
          
          if (!groupsMap.has(item.group_id)) {
            groupsMap.set(item.group_id, {
              id: item.group_id,
              name: item.group_name,
              color: item.group_color || 'bg-green-500',
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
        console.log('✅ SITES: Grupos carregados:', {
          totalGroups: loadedGroups.length,
          groupDetails: loadedGroups.map(g => ({ name: g.name, itemCount: g.items.length }))
        });
        setGroups(loadedGroups);
      } else {
        console.log('ℹ️ SITES: Nenhum dado encontrado');
        setGroups([]);
      }
    } catch (error) {
      console.error('❌ SITES: Erro crítico ao carregar dados:', error);
    }
  };

  const saveSitesToDatabase = async (newGroups: SiteGroup[]) => {
    if (!user?.id) {
      console.error('❌ SITES: Usuário não encontrado para salvar');
      return;
    }
    
    try {
      console.log('🔄 SITES: Iniciando salvamento:', {
        userId: user.id,
        groupCount: newGroups.length,
        totalItems: newGroups.reduce((acc, g) => acc + g.items.length, 0)
      });
      
      for (const group of newGroups) {
        console.log(`🔄 SITES: Processando grupo: ${group.name} (${group.items.length} itens)`);
        
        const { error: deleteError } = await supabase
          .from('sites_data')
          .delete()
          .eq('group_id', group.id)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('❌ SITES: Erro ao deletar:', deleteError);
          throw deleteError;
        }

        const insertData = group.items.length > 0 
          ? group.items.map((item, index) => {
              console.log(`📝 SITES: Preparando item ${index + 1}:`, {
                id: item.id,
                elemento: item.elemento,
                hasAttachments: !!item.attachments?.length
              });

              return {
                user_id: user.id,
                group_id: group.id,
                group_name: group.name,
                group_color: group.color,
                is_expanded: group.isExpanded,
                item_data: item
              };
            })
          : [{
              user_id: user.id,
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
          .from('sites_data')
          .insert(insertData)
          .select('id');

        if (insertError) {
          console.error('❌ SITES: Erro ao inserir:', insertError);
          throw insertError;
        }

        console.log('✅ SITES: Dados inseridos:', insertResult?.length || 0);
      }
      
      console.log('🎉 SITES: Salvamento completo!');
    } catch (error) {
      console.error('❌ SITES: Erro crítico no salvamento:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user?.id) {
      console.log('Usuário logado, inicializando dados de sites:', user.id);
      loadSitesData();
      loadColumns();
      loadStatuses();
    }
  }, [user?.id]);

  const createMonth = async (monthName: string) => {
    if (!user?.id) {
      console.error('❌ SITES: Usuário não encontrado para criar mês');
      return;
    }

    try {
      console.log('🆕 SITES: Criando mês:', monthName);
      
      const timestamp = Date.now();
      const newGroup: SiteGroup = {
        id: `${monthName.toLowerCase().replace(/\s+/g, '-')}-sites-${timestamp}`,
        name: monthName.toUpperCase() + ' - SITES',
        color: 'bg-green-500',
        isExpanded: true,
        items: []
      };
      
      const newGroups = [...groups, newGroup];
      console.log('📊 SITES: Salvando novo grupo:', {
        groupId: newGroup.id,
        totalGroups: newGroups.length
      });
      
      setGroups(newGroups);
      await saveSitesToDatabase(newGroups);
      
      console.log('✅ SITES: Mês criado com sucesso');
      return newGroup.id;
    } catch (error) {
      console.error('❌ SITES: Erro ao criar mês:', error);
      throw error;
    }
  };

  const addClient = async (groupId: string, clientData: Partial<SiteItem>) => {
    if (!user?.id) {
      console.error('❌ SITES: Usuário não encontrado para adicionar cliente');
      return;
    }

    try {
      console.log('👤 SITES: Adicionando cliente:', {
        groupId,
        elemento: clientData.elemento,
        servicos: clientData.servicos
      });
      
      const newClient: SiteItem = {
        id: `sites-client-${Date.now()}`,
        elemento: clientData.elemento || 'Novo Cliente',
        servicos: clientData.servicos || '',
        informacoes: '',
        attachments: []
      };

      customColumns.forEach(column => {
        newClient[column.id] = column.type === 'status' ? '' : '';
      });

      const newGroups = groups.map(group => 
        group.id === groupId 
          ? { ...group, items: group.items.filter(item => item.id !== `empty-${groupId}`).concat(newClient) }
          : group
      );
      
      console.log('📊 SITES: Salvando cliente no grupo:', {
        clientId: newClient.id,
        groupId,
        totalItemsInGroup: newGroups.find(g => g.id === groupId)?.items.length
      });
      
      setGroups(newGroups);
      await saveSitesToDatabase(newGroups);
      
      console.log('✅ SITES: Cliente adicionado com sucesso');
      return newClient.id;
    } catch (error) {
      console.error('❌ SITES: Erro ao adicionar cliente:', error);
      throw error;
    }
  };

  const addColumn = async (name: string, type: 'status' | 'text') => {
    if (!user?.id) {
      console.error('❌ SITES: Usuário não encontrado para adicionar coluna');
      return;
    }

    try {
      console.log('🆕 SITES: Adicionando coluna:', { name, type });
      
      const newColumn: SiteColumn = {
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name,
        type,
        isDefault: false
      };
      
      const { data, error } = await supabase
        .from('column_config')
        .insert({
          column_id: newColumn.id,
          column_name: newColumn.name,
          column_type: newColumn.type,
          module: 'sites',
          is_default: false,
          user_id: user.id
        })
        .select();

      console.log('📊 SITES: Resultado inserção coluna:', { data, error });

      if (error) {
        console.error('❌ SITES: Erro ao salvar coluna:', error);
        throw error;
      }
      
      setColumns(prev => [...prev, newColumn]);
      setCustomColumns(prev => [...prev, newColumn]);
      
      const newGroups = groups.map(group => ({
        ...group,
        items: group.items.map(item => ({
          ...item,
          [newColumn.id]: type === 'status' ? '' : ''
        }))
      }));
      
      setGroups(newGroups);
      await saveSitesToDatabase(newGroups);
      
      console.log('✅ SITES: Coluna adicionada com sucesso');
    } catch (error) {
      console.error('❌ SITES: Erro ao adicionar coluna:', error);
      throw error;
    }
  };

  const addStatus = async (status: ServiceStatus) => {
    if (!user?.id) {
      console.error('❌ SITES: Usuário não encontrado para adicionar status');
      return;
    }

    try {
      console.log('🆕 SITES: Adicionando status:', status);
      
      const { data, error } = await supabase
        .from('status_config')
        .insert({
          status_id: status.id,
          status_name: status.name,
          status_color: status.color,
          module: 'sites',
          user_id: user.id
        })
        .select();

      console.log('📊 SITES: Resultado inserção status:', { data, error });

      if (error) {
        console.error('❌ SITES: Erro ao salvar status:', error);
        throw error;
      }
      
      setStatuses(prev => [...prev, status]);
      console.log('✅ SITES: Status adicionado com sucesso');
    } catch (error) {
      console.error('❌ SITES: Erro ao adicionar status:', error);
      throw error;
    }
  };

  const updateStatus = async (statusId: string, updates: Partial<ServiceStatus>) => {
    if (!user?.id) {
      console.error('Usuário não encontrado para atualizar status');
      return;
    }

    try {
      console.log('Atualizando status de sites:', { statusId, updates, userId: user.id });
      
      setStatuses(prev => prev.map(status => 
        status.id === statusId ? { ...status, ...updates } : status
      ));

      const { error } = await supabase
        .from('status_config')
        .update({
          status_name: updates.name,
          status_color: updates.color
        })
        .eq('status_id', statusId)
        .eq('module', 'sites')
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
      console.log('Deletando status de sites:', { statusId, userId: user.id });
      
      setStatuses(prev => prev.filter(status => status.id !== statusId));

      const { error } = await supabase
        .from('status_config')
        .delete()
        .eq('status_id', statusId)
        .eq('module', 'sites')
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

  const updateColumn = async (id: string, updates: Partial<SiteColumn>) => {
    if (!user?.id) {
      console.error('Usuário não encontrado para atualizar coluna');
      return;
    }

    try {
      console.log('Atualizando coluna de sites:', { id, updates, userId: user.id });
      
      setColumns(prev => prev.map(col => 
        col.id === id ? { ...col, ...updates } : col
      ));
      
      setCustomColumns(prev => prev.map(col => 
        col.id === id ? { ...col, ...updates } : col
      ));

      const { error } = await supabase
        .from('column_config')
        .update({
          column_name: updates.name,
          column_type: updates.type
        })
        .eq('column_id', id)
        .eq('module', 'sites')
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
      console.log('Deletando coluna de sites:', { id, userId: user.id });
      
      setColumns(prev => prev.filter(col => col.id !== id));
      setCustomColumns(prev => prev.filter(col => col.id !== id));
      
      const { error } = await supabase
        .from('column_config')
        .delete()
        .eq('column_id', id)
        .eq('module', 'sites')
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
      await saveSitesToDatabase(newGroups);
      
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
      await saveSitesToDatabase(newGroups);
      
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
      await saveSitesToDatabase(newGroups);
      
      console.log('Cliente deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
    }
  };

  const updateClient = async (itemId: string, updates: Partial<SiteItem>) => {
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
              type: firstAttachment.type,
              size: firstAttachment.size
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
            await saveSitesToDatabase(newGroups);
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
      await saveSitesToDatabase(newGroups);
      console.log('✅ Cliente atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const getClientFiles = (clientId: string): { name: string; data: string; type: string; size: number }[] => {
    const client = groups.flatMap(g => g.items).find(item => item.id === clientId);
    if (!client || !client.attachments) return [];
    
    return client.attachments.map(attachment => ({
      name: attachment.name,
      data: attachment.data,
      type: attachment.type,
      size: attachment.size || 0
    }));
  };

  return {
    groups,
    columns,
    customColumns,
    statuses,
    updateGroups: async (newGroups: SiteGroup[]) => {
      console.log('🔄 SITES: Atualizando grupos:', newGroups.length);
      try {
        setGroups(newGroups);
        await saveSitesToDatabase(newGroups);
        console.log('✅ SITES: Grupos atualizados');
      } catch (error) {
        console.error('❌ SITES: Erro ao atualizar grupos:', error);
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
      if (!user?.id) return;
      try {
        const newGroups = groups.map(group => 
          group.id === groupId 
            ? { ...group, name: newName.toUpperCase() + ' - SITES' }
            : group
        );
        setGroups(newGroups);
        await saveSitesToDatabase(newGroups);
      } catch (error) {
        console.error('❌ SITES: Erro ao atualizar mês:', error);
        throw error;
      }
    },
    deleteMonth: async (groupId: string) => {
      if (!user?.id) return;
      try {
        const { error } = await supabase
          .from('sites_data')
          .delete()
          .eq('group_id', groupId)
          .eq('user_id', user.id);

        if (error) throw error;
        setGroups(groups.filter(group => group.id !== groupId));
      } catch (error) {
        console.error('❌ SITES: Erro ao deletar mês:', error);
        throw error;
      }
    },
    duplicateMonth: async (sourceGroupId: string, newMonthName: string) => {
      if (!user?.id) return;
      try {
        const groupToDuplicate = groups.find(g => g.id === sourceGroupId);
        if (!groupToDuplicate) throw new Error('Grupo não encontrado');
        
        const timestamp = Date.now();
        const newGroupId = `${newMonthName.toLowerCase().replace(/\s+/g, '-')}-sites-${timestamp}`;
        
        const newGroup: SiteGroup = {
          id: newGroupId,
          name: newMonthName.toUpperCase() + ' - SITES',
          color: groupToDuplicate.color,
          isExpanded: true,
          items: groupToDuplicate.items.map((item, index) => ({
            ...item,
            id: `sites-${newMonthName.toLowerCase()}-${timestamp}-${index}`,
            informacoes: '',
            observacoes: '',
            attachments: []
          }))
        };
        
        const newGroups = [...groups, newGroup];
        setGroups(newGroups);
        await saveSitesToDatabase(newGroups);
        return newGroupId;
      } catch (error) {
        console.error('❌ SITES: Erro ao duplicar mês:', error);
        throw error;
      }
    }
  };
};
