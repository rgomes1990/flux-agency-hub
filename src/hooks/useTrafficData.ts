import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TrafficItem {
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
  const [columns, setColumns] = useState<TrafficColumn[]>([
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
      console.log('❌ TRAFFIC: Usuário não encontrado para carregar colunas');
      return;
    }
    
    try {
      console.log('🔄 TRAFFIC: Carregando colunas para usuário:', user.id);
      const { data, error } = await supabase
        .from('column_config')
        .select('*')
        .eq('module', 'traffic')
        .eq('user_id', user.id);

      console.log('📊 TRAFFIC: Resposta colunas:', { data, error });

      if (error) {
        console.error('❌ TRAFFIC: Erro ao carregar colunas:', error);
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
        const newColumns = [...defaultColumns, ...customColumns.filter(col => !col.isDefault)];
        console.log('✅ TRAFFIC: Colunas atualizadas:', newColumns.length);
        setColumns(newColumns);
      }
    } catch (error) {
      console.error('❌ TRAFFIC: Erro crítico ao carregar colunas:', error);
    }
  };

  // Carregar status personalizados do Supabase
  const loadStatuses = async () => {
    if (!user?.id) {
      console.log('❌ TRAFFIC: Usuário não encontrado para carregar status');
      return;
    }
    
    try {
      console.log('🔄 TRAFFIC: Carregando status para usuário:', user.id);
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'traffic')
        .eq('user_id', user.id);

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

        setStatuses(prev => {
          const defaultStatuses = prev.slice(0, 5);
          const newStatuses = [...defaultStatuses, ...customStatuses];
          console.log('✅ TRAFFIC: Status atualizados:', newStatuses.length);
          return newStatuses;
        });
      }
    } catch (error) {
      console.error('❌ TRAFFIC: Erro crítico ao carregar status:', error);
    }
  };

  // Carregar dados do Supabase
  const loadTrafficData = async () => {
    if (!user?.id) {
      console.log('❌ TRAFFIC: Usuário não encontrado para carregar dados');
      return;
    }
    
    try {
      console.log('🔄 TRAFFIC: Carregando dados para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('traffic_data')
        .select('*')
        .eq('user_id', user.id)
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
            item_data_type: typeof item.item_data,
            item_data_keys: typeof item.item_data === 'object' ? Object.keys(item.item_data || {}) : 'not-object'
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
          group.items.push(itemData);
        });

        const loadedGroups = Array.from(groupsMap.values());
        console.log('✅ TRAFFIC: Grupos carregados:', {
          totalGroups: loadedGroups.length,
          groupDetails: loadedGroups.map(g => ({ name: g.name, itemCount: g.items.length }))
        });
        setGroups(loadedGroups);
      } else {
        console.log('ℹ️ TRAFFIC: Nenhum dado encontrado');
        setGroups([]);
      }
    } catch (error) {
      console.error('❌ TRAFFIC: Erro crítico ao carregar dados:', error);
    }
  };

  // Salvar dados no Supabase
  const saveTrafficToDatabase = async (newGroups: TrafficGroup[]) => {
    if (!user?.id) {
      console.error('❌ TRAFFIC: Usuário não encontrado para salvar');
      return;
    }
    
    try {
      console.log('🔄 TRAFFIC: Iniciando salvamento:', {
        userId: user.id,
        groupCount: newGroups.length,
        totalItems: newGroups.reduce((acc, g) => acc + g.items.length, 0)
      });
      
      for (const group of newGroups) {
        console.log(`🔄 TRAFFIC: Processando grupo: ${group.name} (${group.items.length} itens)`);
        
        // Deletar dados existentes do grupo
        const { error: deleteError } = await supabase
          .from('traffic_data')
          .delete()
          .eq('group_id', group.id)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('❌ TRAFFIC: Erro ao deletar:', deleteError);
          throw deleteError;
        }

        // Inserir dados atualizados do grupo
        if (group.items.length > 0) {
          const insertData = group.items.map((item, index) => {
            console.log(`📝 TRAFFIC: Preparando item ${index + 1}:`, {
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
      }
      
      console.log('🎉 TRAFFIC: Salvamento completo!');
    } catch (error) {
      console.error('❌ TRAFFIC: Erro crítico no salvamento:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user?.id) {
      console.log('Usuário logado, inicializando dados de tráfego:', user.id);
      loadTrafficData();
      loadColumns();
      loadStatuses();
    }
  }, [user?.id]);

  const createMonth = async (monthName: string) => {
    if (!user?.id) {
      console.error('❌ TRAFFIC: Usuário não encontrado para criar mês');
      return;
    }

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
      
      const newGroups = [...groups, newGroup];
      console.log('📊 TRAFFIC: Salvando novo grupo:', {
        groupId: newGroup.id,
        totalGroups: newGroups.length
      });
      
      setGroups(newGroups);
      await saveTrafficToDatabase(newGroups);
      
      console.log('✅ TRAFFIC: Mês criado com sucesso');
      return newGroup.id;
    } catch (error) {
      console.error('❌ TRAFFIC: Erro ao criar mês:', error);
      throw error;
    }
  };

  const addClient = async (groupId: string, clientData: Partial<TrafficItem>) => {
    if (!user?.id) {
      console.error('❌ TRAFFIC: Usuário não encontrado para adicionar cliente');
      return;
    }

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
        janeiro: '', fevereiro: '', marco: '', abril: '', maio: '', junho: '',
        julho: '', agosto: '', setembro: '', outubro: '', novembro: '', dezembro: '',
        informacoes: '', attachments: []
      };

      // Adicionar colunas customizadas
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
    if (!user?.id) {
      console.error('❌ TRAFFIC: Usuário não encontrado para adicionar coluna');
      return;
    }

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
          user_id: user.id
        })
        .select();

      console.log('📊 TRAFFIC: Resultado inserção coluna:', { data, error });

      if (error) {
        console.error('❌ TRAFFIC: Erro ao salvar coluna:', error);
        throw error;
      }
      
      setColumns(prev => [...prev, newColumn]);
      
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
    if (!user?.id) {
      console.error('❌ TRAFFIC: Usuário não encontrado para adicionar status');
      return;
    }

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
          user_id: user.id
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
    updateMonth: async (groupId: string, newName: string) => {
      if (!user?.id) return;
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
      if (!user?.id) return;
      try {
        const { error } = await supabase
          .from('traffic_data')
          .delete()
          .eq('group_id', groupId)
          .eq('user_id', user.id);

        if (error) throw error;
        setGroups(groups.filter(group => group.id !== groupId));
      } catch (error) {
        console.error('❌ TRAFFIC: Erro ao deletar mês:', error);
        throw error;
      }
    },
    duplicateMonth: async (sourceGroupId: string, newMonthName: string) => {
      if (!user?.id) return;
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
            janeiro: '', fevereiro: '', marco: '', abril: '', maio: '', junho: '',
            julho: '', agosto: '', setembro: '', outubro: '', novembro: '', dezembro: '',
            informacoes: '', observacoes: '', attachments: []
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
      if (!user?.id) return;
      try {
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
          .eq('module', 'traffic')
          .eq('user_id', user.id);
        if (error) throw error;
      } catch (error) {
        console.error('❌ TRAFFIC: Erro ao atualizar status:', error);
        throw error;
      }
    },
    deleteStatus: async (statusId: string) => {
      if (!user?.id) return;
      try {
        setStatuses(prev => prev.filter(status => status.id !== statusId));
        const { error } = await supabase
          .from('status_config')
          .delete()
          .eq('status_id', statusId)
          .eq('module', 'traffic')
          .eq('user_id', user.id);
        if (error) throw error;
      } catch (error) {
        console.error('❌ TRAFFIC: Erro ao deletar status:', error);
        throw error;
      }
    },
    updateColumn: async (id: string, updates: Partial<TrafficColumn>) => {
      if (!user?.id) return;
      try {
        setColumns(prev => prev.map(col => 
          col.id === id ? { ...col, ...updates } : col
        ));
        const { error } = await supabase
          .from('column_config')
          .update({
            column_name: updates.name,
            column_type: updates.type
          })
          .eq('column_id', id)
          .eq('module', 'traffic')
          .eq('user_id', user.id);
        if (error) throw error;
      } catch (error) {
        console.error('❌ TRAFFIC: Erro ao atualizar coluna:', error);
        throw error;
      }
    },
    deleteColumn: async (id: string) => {
      if (!user?.id) return;
      try {
        setColumns(prev => prev.filter(col => col.id !== id));
        const { error } = await supabase
          .from('column_config')
          .delete()
          .eq('column_id', id)
          .eq('module', 'traffic')
          .eq('user_id', user.id);
        if (error) throw error;
        
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
      } catch (error) {
        console.error('❌ TRAFFIC: Erro ao deletar coluna:', error);
        throw error;
      }
    },
    updateItemStatus: async (itemId: string, field: string, statusId: string) => {
      try {
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
      } catch (error) {
        console.error('❌ TRAFFIC: Erro ao atualizar status do item:', error);
        throw error;
      }
    },
    deleteClient: async (itemId: string) => {
      try {
        const newGroups = groups.map(group => ({
          ...group,
          items: group.items.filter(item => item.id !== itemId)
        }));
        setGroups(newGroups);
        await saveTrafficToDatabase(newGroups);
      } catch (error) {
        console.error('❌ TRAFFIC: Erro ao deletar cliente:', error);
        throw error;
      }
    },
    updateClient: async (itemId: string, updates: Partial<TrafficItem>) => {
      try {
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
      } catch (error) {
        console.error('❌ TRAFFIC: Erro ao atualizar cliente:', error);
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
