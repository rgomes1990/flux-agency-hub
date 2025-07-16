
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TrafficItem {
  id: string;
  elemento: string;
  servicos: string;
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
  const [groups, setGroups] = useState<TrafficGroup[]>([]);
  const [columns, setColumns] = useState<TrafficColumn[]>([]);
  const [customColumns, setCustomColumns] = useState<TrafficColumn[]>([]);
  const [statuses, setStatuses] = useState<ServiceStatus[]>([]);

  const { user, logAudit } = useAuth();

  // Carregar colunas personalizadas do Supabase
  const loadColumns = async () => {
    try {
      console.log('🔄 TRAFFIC: Carregando colunas');
      const { data, error } = await supabase
        .from('column_config')
        .select('*')
        .eq('module', 'traffic');

      console.log('📊 TRAFFIC: Resposta colunas:', { data, error });

      if (error) {
        console.error('❌ TRAFFIC: Erro ao carregar colunas:', error);
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
        setColumns(customColumnsFromDB);
        console.log('✅ TRAFFIC: Colunas carregadas:', customColumnsFromDB.length);
      } else {
        setCustomColumns([]);
        setColumns([]);
        console.log('ℹ️ TRAFFIC: Nenhuma coluna encontrada');
      }
    } catch (error) {
      console.error('❌ TRAFFIC: Erro crítico ao carregar colunas:', error);
    }
  };

  // Carregar status personalizados do Supabase
  const loadStatuses = async () => {
    try {
      console.log('🔄 TRAFFIC: Carregando status');
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'traffic');

      console.log('📊 TRAFFIC: Resposta status:', { data, error });

      if (error) {
        console.error('❌ TRAFFIC: Erro ao carregar status:', error);
        return;
      }

      if (data && data.length > 0) {
        const customStatuses = data.map(status => ({
          id: status.status_id,
          name: status.status_name,
          color: status.status_color
        }));

        setStatuses(customStatuses);
        console.log('✅ TRAFFIC: Status carregados:', customStatuses.length);
      } else {
        setStatuses([]);
        console.log('ℹ️ TRAFFIC: Nenhum status encontrado');
      }
    } catch (error) {
      console.error('❌ TRAFFIC: Erro crítico ao carregar status:', error);
    }
  };

  // Carregar dados do Supabase
  const loadTrafficData = async () => {
    try {
      console.log('🔄 TRAFFIC: Carregando dados');
      
      const { data, error } = await supabase
        .from('traffic_data')
        .select('*')
        .order('created_at', { ascending: true });

      console.log('📊 TRAFFIC: Resposta dados:', { 
        dataLength: data?.length || 0, 
        error,
        sampleData: data?.[0] 
      });

      if (error) {
        console.error('❌ TRAFFIC: Erro ao carregar dados:', error);
        return;
      }

      if (data && data.length > 0) {
        const groupsMap = new Map<string, TrafficGroup>();

        data.forEach((item, index) => {
          console.log(`🔍 TRAFFIC: Processando item ${index + 1}:`, {
            group_id: item.group_id,
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
            console.error('❌ TRAFFIC: Erro ao fazer parse do item_data:', parseError);
            return;
          }
          
          if (!groupsMap.has(item.group_id)) {
            groupsMap.set(item.group_id, {
              id: item.group_id,
              name: item.group_name,
              color: item.group_color || 'bg-red-500',
              isExpanded: item.is_expanded,
              items: []
            });
          }

          const group = groupsMap.get(item.group_id)!;
          if (itemData && itemData.id && itemData.id !== `empty-${item.group_id}`) {
            group.items.push(itemData);
          }
        });

        const loadedGroups = Array.from(groupsMap.values());
        console.log('✅ TRAFFIC: Grupos carregados:', {
          totalGroups: loadedGroups.length,
          groupDetails: loadedGroups.map(g => ({ name: g.name, itemCount: g.items.length }))
        });
        setGroups(loadedGroups);
      } else {
        setGroups([]);
        console.log('ℹ️ TRAFFIC: Nenhum dado encontrado');
      }
    } catch (error) {
      console.error('❌ TRAFFIC: Erro crítico ao carregar dados:', error);
    }
  };

  // Salvar dados no Supabase
  const saveTrafficToDatabase = async (newGroups: TrafficGroup[]) => {
    try {
      console.log('🔄 TRAFFIC: Iniciando salvamento:', {
        groupCount: newGroups.length,
        totalItems: newGroups.reduce((acc, g) => acc + g.items.length, 0)
      });
      
      for (const group of newGroups) {
        console.log(`🔄 TRAFFIC: Processando grupo: ${group.name} (${group.items.length} itens)`);
        
        // Deletar dados existentes do grupo
        const { error: deleteError } = await supabase
          .from('traffic_data')
          .delete()
          .eq('group_id', group.id);

        if (deleteError) {
          console.error('❌ TRAFFIC: Erro ao deletar:', deleteError);
          throw deleteError;
        }

        // Sempre inserir dados do grupo
        const insertData = group.items.length > 0 
          ? group.items.map((item, index) => {
              console.log(`📝 TRAFFIC: Preparando item ${index + 1}:`, {
                id: item.id,
                elemento: item.elemento
              });

              return {
                group_id: group.id,
                group_name: group.name,
                group_color: group.color,
                is_expanded: group.isExpanded,
                item_data: item,
                user_id: null // Sempre null para tornar global
              };
            })
          : [{
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
              },
              user_id: null // Sempre null para tornar global
            }];

        console.log('📝 TRAFFIC: Dados para inserir:', {
          groupId: group.id,
          itemCount: insertData.length
        });

        const { data: insertResult, error: insertError } = await supabase
          .from('traffic_data')
          .insert(insertData)
          .select('id');

        if (insertError) {
          console.error('❌ TRAFFIC: Erro ao inserir:', insertError);
          throw insertError;
        }

        console.log('✅ TRAFFIC: Dados inseridos:', insertResult?.length || 0);
      }
      
      console.log('🎉 TRAFFIC: Salvamento completo!');
    } catch (error) {
      console.error('❌ TRAFFIC: Erro crítico no salvamento:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      console.log('Inicializando dados de tráfego globais para usuário:', user.username);
      loadTrafficData();
      loadColumns();
      loadStatuses();
    } else {
      console.log('Usuário não logado, aguardando autenticação...');
    }
  }, [user]);

  const createMonth = async (monthName: string) => {
    try {
      console.log('🆕 TRAFFIC: Criando mês:', monthName);
      
      const timestamp = Date.now();
      const newGroup: TrafficGroup = {
        id: `${monthName.toLowerCase().replace(/\s+/g, '-')}-trafego-${timestamp}`,
        name: monthName.toUpperCase() + ' - TRÁFEGO',
        color: 'bg-red-500',
        isExpanded: true,
        items: []
      };
      
      console.log('📊 TRAFFIC: Grupo criado:', {
        groupId: newGroup.id,
        groupName: newGroup.name
      });

      // Adicionar ao estado local
      const newGroups = [...groups, newGroup];
      setGroups(newGroups);
      
      // Salvar no banco
      try {
        await saveTrafficToDatabase(newGroups);
        console.log('✅ TRAFFIC: Mês criado e salvo com sucesso');
        return newGroup.id;
      } catch (saveError) {
        console.error('❌ TRAFFIC: Erro ao salvar no banco:', saveError);
        // Reverter o estado se falhar
        setGroups(groups);
        throw saveError;
      }
    } catch (error) {
      console.error('❌ TRAFFIC: Erro ao criar mês:', error);
      throw error;
    }
  };

  const addClient = async (groupId: string, clientData: Partial<TrafficItem>) => {
    try {
      console.log('👤 TRAFFIC: Adicionando cliente:', {
        groupId,
        elemento: clientData.elemento,
        servicos: clientData.servicos
      });
      
      const newClient: TrafficItem = {
        id: `traffic-client-${Date.now()}`,
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
      
      console.log('📊 TRAFFIC: Salvando cliente no grupo:', {
        clientId: newClient.id,
        groupId,
        totalItemsInGroup: newGroups.find(g => g.id === groupId)?.items.length
      });
      
      setGroups(newGroups);
      await saveTrafficToDatabase(newGroups);
      
      console.log('✅ TRAFFIC: Cliente adicionado com sucesso');
      return newClient.id;
    } catch (error) {
      console.error('❌ TRAFFIC: Erro ao adicionar cliente:', error);
      throw error;
    }
  };

  const addColumn = async (name: string, type: 'status' | 'text') => {
    try {
      console.log('🆕 TRAFFIC: Adicionando coluna:', { name, type });
      
      const newColumn: TrafficColumn = {
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
          module: 'traffic',
          is_default: false,
          user_id: null // Sempre null para tornar global
        })
        .select();

      console.log('📊 TRAFFIC: Resultado inserção coluna:', { data, error });

      if (error) {
        console.error('❌ TRAFFIC: Erro ao salvar coluna:', error);
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
      await saveTrafficToDatabase(newGroups);
      
      console.log('✅ TRAFFIC: Coluna adicionada com sucesso');
    } catch (error) {
      console.error('❌ TRAFFIC: Erro ao adicionar coluna:', error);
      throw error;
    }
  };

  const addStatus = async (status: ServiceStatus) => {
    try {
      console.log('🆕 TRAFFIC: Adicionando status:', status);
      
      // Salvar no banco
      const { data, error } = await supabase
        .from('status_config')
        .insert({
          status_id: status.id,
          status_name: status.name,
          status_color: status.color,
          module: 'traffic',
          user_id: null // Sempre null para tornar global
        })
        .select();

      console.log('📊 TRAFFIC: Resultado inserção status:', { data, error });

      if (error) {
        console.error('❌ TRAFFIC: Erro ao salvar status:', error);
        throw error;
      }
      
      setStatuses(prev => [...prev, status]);
      console.log('✅ TRAFFIC: Status adicionado com sucesso');
    } catch (error) {
      console.error('❌ TRAFFIC: Erro ao adicionar status:', error);
      throw error;
    }
  };

  return {
    groups,
    columns,
    customColumns,
    statuses,
    updateGroups: async (newGroups: TrafficGroup[]) => {
      console.log('🔄 TRAFFIC: Atualizando grupos:', newGroups.length);
      try {
        setGroups(newGroups);
        await saveTrafficToDatabase(newGroups);
        console.log('✅ TRAFFIC: Grupos atualizados');
      } catch (error) {
        console.error('❌ TRAFFIC: Erro ao atualizar grupos:', error);
        throw error;
      }
    },
    createMonth,
    addClient,
    addColumn,
    addStatus,
    updateMonth: async (groupId: string, newName: string) => {
      try {
        const newGroups = groups.map(group => 
          group.id === groupId 
            ? { ...group, name: newName.toUpperCase() + ' - TRÁFEGO' }
            : group
        );
        setGroups(newGroups);
        await saveTrafficToDatabase(newGroups);
      } catch (error) {
        console.error('❌ TRAFFIC: Erro ao atualizar mês:', error);
        throw error;
      }
    },
    deleteMonth: async (groupId: string) => {
      try {
        const { error } = await supabase
          .from('traffic_data')
          .delete()
          .eq('group_id', groupId);

        if (error) throw error;
        setGroups(groups.filter(group => group.id !== groupId));
      } catch (error) {
        console.error('❌ TRAFFIC: Erro ao deletar mês:', error);
        throw error;
      }
    },
    duplicateMonth: async (sourceGroupId: string, newMonthName: string) => {
      try {
        const groupToDuplicate = groups.find(g => g.id === sourceGroupId);
        if (!groupToDuplicate) throw new Error('Grupo não encontrado');
        
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
            informacoes: '',
            observacoes: '',
            attachments: []
          }))
        };
        
        const newGroups = [...groups, newGroup];
        setGroups(newGroups);
        await saveTrafficToDatabase(newGroups);
        return newGroupId;
      } catch (error) {
        console.error('❌ TRAFFIC: Erro ao duplicar mês:', error);
        throw error;
      }
    },
    updateStatus: async (statusId: string, updates: Partial<ServiceStatus>) => {
      try {
        console.log('Atualizando status:', { statusId, updates });
        
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
          .eq('module', 'traffic');

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
    },
    deleteStatus: async (statusId: string) => {
      try {
        console.log('Deletando status:', { statusId });
        
        setStatuses(prev => prev.filter(status => status.id !== statusId));

        const { error } = await supabase
          .from('status_config')
          .delete()
          .eq('status_id', statusId)
          .eq('module', 'traffic');

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
    },
    updateColumn: async (id: string, updates: Partial<TrafficColumn>) => {
      try {
        console.log('Atualizando coluna:', { id, updates });
        
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
          .eq('module', 'traffic');

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
    },
    deleteColumn: async (id: string) => {
      try {
        console.log('Deletando coluna:', { id });
        
        setColumns(prev => prev.filter(col => col.id !== id));
        setCustomColumns(prev => prev.filter(col => col.id !== id));
        
        const { error } = await supabase
          .from('column_config')
          .delete()
          .eq('column_id', id)
          .eq('module', 'traffic');

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
        await saveTrafficToDatabase(newGroups);
        
        console.log('Coluna deletada com sucesso');
      } catch (error) {
        console.error('Erro ao deletar coluna:', error);
        throw error;
      }
    },
    updateItemStatus: async (itemId: string, field: string, statusId: string) => {
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
        await saveTrafficToDatabase(newGroups);
        
        console.log('Status do item atualizado com sucesso');
      } catch (error) {
        console.error('Erro ao atualizar status do item:', error);
      }
    },
    deleteClient: async (itemId: string) => {
      try {
        console.log('Deletando cliente:', itemId);
        
        const newGroups = groups.map(group => ({
          ...group,
          items: group.items.filter(item => item.id !== itemId)
        }));
        
        setGroups(newGroups);
        await saveTrafficToDatabase(newGroups);
        
        console.log('Cliente deletado com sucesso');
      } catch (error) {
        console.error('Erro ao deletar cliente:', error);
      }
    },
    updateClient: async (itemId: string, updates: Partial<TrafficItem>) => {
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
              await saveTrafficToDatabase(newGroups);
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
        await saveTrafficToDatabase(newGroups);
        console.log('✅ Cliente atualizado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao atualizar cliente:', error);
        throw error;
      }
    },
    getClientFiles: (clientId: string): File[] => {
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
    }
  };
};
