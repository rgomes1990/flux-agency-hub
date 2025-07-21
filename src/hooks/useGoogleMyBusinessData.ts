import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface GoogleMyBusinessItem {
  id: string;
  elemento: string;
  servicos: string;
  informacoes: string;
  observacoes?: string;
  attachments?: { name: string; data: string; type: string }[];
  [key: string]: any;
}

interface GoogleMyBusinessGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: GoogleMyBusinessItem[];
}

interface GoogleMyBusinessColumn {
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

export const useGoogleMyBusinessData = () => {
  const [groups, setGroups] = useState<GoogleMyBusinessGroup[]>([]);
  const [columns, setColumns] = useState<GoogleMyBusinessColumn[]>([]);
  const [customColumns, setCustomColumns] = useState<GoogleMyBusinessColumn[]>([]);
  const [statuses, setStatuses] = useState<ServiceStatus[]>([]);

  const { user, logAudit } = useAuth();

  // Carregar colunas personalizadas do Supabase
  const loadColumns = async () => {
    try {
      console.log('🔄 GMB: Carregando colunas');
      const { data, error } = await supabase
        .from('column_config')
        .select('*')
        .eq('module', 'google_my_business');

      console.log('📊 GMB: Resposta colunas:', { data, error });

      if (error) {
        console.error('❌ GMB: Erro ao carregar colunas:', error);
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
        console.log('✅ GMB: Colunas carregadas:', customColumnsFromDB.length);
      } else {
        setCustomColumns([]);
        setColumns([]);
        console.log('ℹ️ GMB: Nenhuma coluna encontrada');
      }
    } catch (error) {
      console.error('❌ GMB: Erro crítico ao carregar colunas:', error);
    }
  };

  // Carregar status personalizados do Supabase
  const loadStatuses = async () => {
    try {
      console.log('🔄 GMB: Carregando status');
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'google_my_business');

      console.log('📊 GMB: Resposta status:', { data, error });

      if (error) {
        console.error('❌ GMB: Erro ao carregar status:', error);
        return;
      }

      if (data && data.length > 0) {
        const customStatuses = data.map(status => ({
          id: status.status_id,
          name: status.status_name,
          color: status.status_color
        }));

        setStatuses(customStatuses);
        console.log('✅ GMB: Status carregados:', customStatuses.length);
      } else {
        setStatuses([]);
        console.log('ℹ️ GMB: Nenhum status encontrado');
      }
    } catch (error) {
      console.error('❌ GMB: Erro crítico ao carregar status:', error);
    }
  };

  // Criar uma nova tabela específica para Google My Business
  const loadGoogleMyBusinessData = async () => {
    try {
      console.log('🔄 GMB: Carregando dados');
      
      const { data, error } = await supabase
        .from('google_my_business_data')
        .select('*')
        .order('created_at', { ascending: true });

      console.log('📊 GMB: Resposta dados:', { 
        dataLength: data?.length || 0, 
        error,
        sampleData: data?.[0] 
      });

      if (error && error.code !== 'PGRST116') { // 116 = table doesn't exist
        console.error('❌ GMB: Erro ao carregar dados:', error);
        return;
      }

      if (data && data.length > 0) {
        const groupsMap = new Map<string, GoogleMyBusinessGroup>();

        data.forEach((item, index) => {
          console.log(`🔍 GMB: Processando item ${index + 1}:`, {
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
            console.error('❌ GMB: Erro ao fazer parse do item_data:', parseError);
            return;
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
          if (itemData && itemData.id && itemData.id !== `empty-${item.group_id}`) {
            group.items.push(itemData);
          }
        });

        const loadedGroups = Array.from(groupsMap.values());
        console.log('✅ GMB: Grupos carregados:', {
          totalGroups: loadedGroups.length,
          groupDetails: loadedGroups.map(g => ({ name: g.name, itemCount: g.items.length }))
        });
        setGroups(loadedGroups);
      } else {
        setGroups([]);
        console.log('ℹ️ GMB: Nenhum dado encontrado');
      }
    } catch (error) {
      console.error('❌ GMB: Erro crítico ao carregar dados:', error);
    }
  };

  // Salvar dados no Supabase
  const saveGoogleMyBusinessToDatabase = async (newGroups: GoogleMyBusinessGroup[]) => {
    try {
      console.log('🔄 GMB: Iniciando salvamento:', {
        groupCount: newGroups.length,
        totalItems: newGroups.reduce((acc, g) => acc + g.items.length, 0)
      });
      
      for (const group of newGroups) {
        console.log(`🔄 GMB: Processando grupo: ${group.name} (${group.items.length} itens)`);
        
        // Deletar dados existentes do grupo
        const { error: deleteError } = await supabase
          .from('google_my_business_data')
          .delete()
          .eq('group_id', group.id);

        if (deleteError) {
          console.error('❌ GMB: Erro ao deletar:', deleteError);
          throw deleteError;
        }

        // Sempre inserir dados do grupo
        const insertData = group.items.length > 0 
          ? group.items.map((item, index) => {
              console.log(`📝 GMB: Preparando item ${index + 1}:`, {
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

        console.log('📝 GMB: Dados para inserir:', {
          groupId: group.id,
          itemCount: insertData.length
        });

        const { data: insertResult, error: insertError } = await supabase
          .from('google_my_business_data')
          .insert(insertData)
          .select('id');

        if (insertError) {
          console.error('❌ GMB: Erro ao inserir:', insertError);
          throw insertError;
        }

        console.log('✅ GMB: Dados inseridos:', insertResult?.length || 0);
      }
      
      console.log('🎉 GMB: Salvamento completo!');
    } catch (error) {
      console.error('❌ GMB: Erro crítico no salvamento:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      console.log('Inicializando dados de Google My Business globais para usuário:', user.username);
      loadGoogleMyBusinessData();
      loadColumns();
      loadStatuses();
    } else {
      console.log('Usuário não logado, aguardando autenticação...');
    }
  }, [user]);

  const createMonth = async (monthName: string) => {
    try {
      console.log('🆕 GMB: Criando mês:', monthName);
      
      const timestamp = Date.now();
      const newGroup: GoogleMyBusinessGroup = {
        id: `${monthName.toLowerCase().replace(/\s+/g, '-')}-gmb-${timestamp}`,
        name: monthName.toUpperCase() + ' - GOOGLE MY BUSINESS',
        color: 'bg-blue-500',
        isExpanded: true,
        items: []
      };
      
      console.log('📊 GMB: Grupo criado:', {
        groupId: newGroup.id,
        groupName: newGroup.name
      });

      // Adicionar ao estado local
      const newGroups = [...groups, newGroup];
      setGroups(newGroups);
      
      // Salvar no banco
      try {
        await saveGoogleMyBusinessToDatabase(newGroups);
        console.log('✅ GMB: Mês criado e salvo com sucesso');
        return newGroup.id;
      } catch (saveError) {
        console.error('❌ GMB: Erro ao salvar no banco:', saveError);
        // Reverter o estado se falhar
        setGroups(groups);
        throw saveError;
      }
    } catch (error) {
      console.error('❌ GMB: Erro ao criar mês:', error);
      throw error;
    }
  };

  const addClient = async (groupId: string, clientData: Partial<GoogleMyBusinessItem>) => {
    try {
      console.log('👤 GMB: Adicionando cliente:', {
        groupId,
        elemento: clientData.elemento,
        servicos: clientData.servicos
      });
      
      const newClient: GoogleMyBusinessItem = {
        id: `gmb-client-${Date.now()}`,
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
      
      console.log('📊 GMB: Salvando cliente no grupo:', {
        clientId: newClient.id,
        groupId,
        totalItemsInGroup: newGroups.find(g => g.id === groupId)?.items.length
      });
      
      setGroups(newGroups);
      await saveGoogleMyBusinessToDatabase(newGroups);
      
      console.log('✅ GMB: Cliente adicionado com sucesso');
      return newClient.id;
    } catch (error) {
      console.error('❌ GMB: Erro ao adicionar cliente:', error);
      throw error;
    }
  };

  const addColumn = async (name: string, type: 'status' | 'text') => {
    try {
      console.log('🆕 GMB: Adicionando coluna:', { name, type });
      
      const newColumn: GoogleMyBusinessColumn = {
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
          module: 'google_my_business',
          is_default: false,
          user_id: null // Sempre null para tornar global
        })
        .select();

      console.log('📊 GMB: Resultado inserção coluna:', { data, error });

      if (error) {
        console.error('❌ GMB: Erro ao salvar coluna:', error);
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
      await saveGoogleMyBusinessToDatabase(newGroups);
      
      console.log('✅ GMB: Coluna adicionada com sucesso');
    } catch (error) {
      console.error('❌ GMB: Erro ao adicionar coluna:', error);
      throw error;
    }
  };

  const addStatus = async (status: ServiceStatus) => {
    try {
      console.log('🆕 GMB: Adicionando status:', status);
      
      // Salvar no banco
      const { data, error } = await supabase
        .from('status_config')
        .insert({
          status_id: status.id,
          status_name: status.name,
          status_color: status.color,
          module: 'google_my_business',
          user_id: null // Sempre null para tornar global
        })
        .select();

      console.log('📊 GMB: Resultado inserção status:', { data, error });

      if (error) {
        console.error('❌ GMB: Erro ao salvar status:', error);
        throw error;
      }
      
      setStatuses(prev => [...prev, status]);
      console.log('✅ GMB: Status adicionado com sucesso');
    } catch (error) {
      console.error('❌ GMB: Erro ao adicionar status:', error);
      throw error;
    }
  };

  return {
    groups,
    columns,
    customColumns,
    statuses,
    updateGroups: async (newGroups: GoogleMyBusinessGroup[]) => {
      console.log('🔄 GMB: Atualizando grupos:', newGroups.length);
      try {
        setGroups(newGroups);
        await saveGoogleMyBusinessToDatabase(newGroups);
        console.log('✅ GMB: Grupos atualizados');
      } catch (error) {
        console.error('❌ GMB: Erro ao atualizar grupos:', error);
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
            ? { ...group, name: newName.toUpperCase() + ' - GOOGLE MY BUSINESS' }
            : group
        );
        setGroups(newGroups);
        await saveGoogleMyBusinessToDatabase(newGroups);
      } catch (error) {
        console.error('❌ GMB: Erro ao atualizar mês:', error);
        throw error;
      }
    },
    deleteMonth: async (groupId: string) => {
      try {
        const { error } = await supabase
          .from('google_my_business_data')
          .delete()
          .eq('group_id', groupId);

        if (error) throw error;
        setGroups(groups.filter(group => group.id !== groupId));
      } catch (error) {
        console.error('❌ GMB: Erro ao deletar mês:', error);
        throw error;
      }
    },
    duplicateMonth: async (sourceGroupId: string, newMonthName: string) => {
      try {
        const groupToDuplicate = groups.find(g => g.id === sourceGroupId);
        if (!groupToDuplicate) throw new Error('Grupo não encontrado');
        
        const timestamp = Date.now();
        const newGroup: GoogleMyBusinessGroup = {
          id: `${newMonthName.toLowerCase().replace(/\s+/g, '-')}-gmb-${timestamp}`,
          name: newMonthName.toUpperCase() + ' - GOOGLE MY BUSINESS',
          color: groupToDuplicate.color,
          isExpanded: true,
          items: groupToDuplicate.items.map(item => ({
            ...item,
            id: `gmb-client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }))
        };

        const newGroups = [...groups, newGroup];
        setGroups(newGroups);
        await saveGoogleMyBusinessToDatabase(newGroups);
        
        return newGroup.id;
      } catch (error) {
        console.error('❌ GMB: Erro ao duplicar mês:', error);
        throw error;
      }
    },
    updateStatus: async (statusId: string, updates: Partial<ServiceStatus>) => {
      try {
        const { error } = await supabase
          .from('status_config')
          .update({
            status_name: updates.name,
            status_color: updates.color
          })
          .eq('status_id', statusId)
          .eq('module', 'google_my_business');

        if (error) throw error;
        
        setStatuses(prev => prev.map(status => 
          status.id === statusId ? { ...status, ...updates } : status
        ));
      } catch (error) {
        console.error('❌ GMB: Erro ao atualizar status:', error);
        throw error;
      }
    },
    deleteStatus: async (statusId: string) => {
      try {
        const { error } = await supabase
          .from('status_config')
          .delete()
          .eq('status_id', statusId)
          .eq('module', 'google_my_business');

        if (error) throw error;
        setStatuses(prev => prev.filter(status => status.id !== statusId));
      } catch (error) {
        console.error('❌ GMB: Erro ao deletar status:', error);
        throw error;
      }
    },
    updateColumn: async (id: string, updates: Partial<GoogleMyBusinessColumn>) => {
      try {
        const { error } = await supabase
          .from('column_config')
          .update({
            column_name: updates.name,
            column_type: updates.type
          })
          .eq('column_id', id)
          .eq('module', 'google_my_business');

        if (error) throw error;
        
        setColumns(prev => prev.map(col => 
          col.id === id ? { ...col, ...updates } : col
        ));
      } catch (error) {
        console.error('❌ GMB: Erro ao atualizar coluna:', error);
        throw error;
      }
    },
    deleteColumn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('column_config')
          .delete()
          .eq('column_id', id)
          .eq('module', 'google_my_business');

        if (error) throw error;
        
        setColumns(prev => prev.filter(col => col.id !== id));
        setCustomColumns(prev => prev.filter(col => col.id !== id));
      } catch (error) {
        console.error('❌ GMB: Erro ao deletar coluna:', error);
        throw error;
      }
    },
    updateItemStatus: async (itemId: string, field: string, statusId: string) => {
      try {
        const newGroups = groups.map(group => ({
          ...group,
          items: group.items.map(item => 
            item.id === itemId ? { ...item, [field]: statusId } : item
          )
        }));
        
        setGroups(newGroups);
        await saveGoogleMyBusinessToDatabase(newGroups);
      } catch (error) {
        console.error('❌ GMB: Erro ao atualizar status do item:', error);
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
        await saveGoogleMyBusinessToDatabase(newGroups);
      } catch (error) {
        console.error('❌ GMB: Erro ao deletar cliente:', error);
        throw error;
      }
    },
    updateClient: async (itemId: string, updates: Partial<GoogleMyBusinessItem>) => {
      try {
        const newGroups = groups.map(group => ({
          ...group,
          items: group.items.map(item => 
            item.id === itemId ? { ...item, ...updates } : item
          )
        }));
        
        setGroups(newGroups);
        await saveGoogleMyBusinessToDatabase(newGroups);
      } catch (error) {
        console.error('❌ GMB: Erro ao atualizar cliente:', error);
        throw error;
      }
    },
    getClientFiles: (clientId: string) => {
      const client = groups.flatMap(g => g.items).find(item => item.id === clientId);
      if (client?.attachments) {
        return client.attachments.map(att => new File([att.data], att.name, { type: att.type }));
      }
      return [];
    }
  };
};