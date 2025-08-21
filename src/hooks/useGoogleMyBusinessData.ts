import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Status {
  id: string;
  name: string;
  color: string;
  [key: string]: any;
}

export interface GoogleMyBusinessItem {
  id: string;
  elemento: string;
  servicos: string;
  informacoes: string;
  observacoes?: string;
  status: Status;
  [key: string]: any;
}

export interface GoogleMyBusinessGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: GoogleMyBusinessItem[];
}

export interface Column {
  id: string;
  name: string;
  type: 'status' | 'text';
}

export function useGoogleMyBusinessData() {
  const [groups, setGroups] = useState<GoogleMyBusinessGroup[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [customColumns, setCustomColumns] = useState<Column[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);

  const loadGoogleMyBusinessData = useCallback(async () => {
    console.log('🔄 Carregando dados do Google My Business...');
    
    try {
      const { data: columnsData, error: columnsError } = await supabase
        .from('column_config')
        .select('*')
        .eq('module', 'google_my_business')
        .order('created_at', { ascending: true });

      if (columnsError) {
        console.error('❌ Erro ao carregar colunas:', columnsError);
        throw columnsError;
      }

      const { data: statusesData, error: statusesError } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'google_my_business')
        .order('created_at', { ascending: true });

      if (statusesError) {
        console.error('❌ Erro ao carregar status:', statusesError);
        throw statusesError;
      }

      const { data, error } = await supabase
        .from('google_my_business_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar dados:', error);
        throw error;
      }

      console.log('📊 Dados carregados:', data?.length, 'registros');

      if (!data || data.length === 0) {
        console.log('📝 Nenhum dado encontrado, criando dados padrão...');
        await createDefaultData();
        return;
      }

      const groupsMap = new Map<string, GoogleMyBusinessGroup>();

      data.forEach(item => {
        if (!groupsMap.has(item.group_name)) {
          groupsMap.set(item.group_name, {
            id: item.group_id,
            name: item.group_name + ' - Google My Business',
            color: item.group_color || 'bg-blue-500',
            isExpanded: true,
            items: []
          });
        }

        const group = groupsMap.get(item.group_name)!;
        
        // Parse item_data as JSON to access the properties
        const itemData = typeof item.item_data === 'string' ? JSON.parse(item.item_data) : item.item_data || {};
        
        const clientItem: GoogleMyBusinessItem = {
          id: item.id,
          elemento: itemData.elemento || 'Novo Cliente',
          servicos: itemData.servicos || '',
          informacoes: itemData.informacoes || '',
          observacoes: itemData.observacoes || '',
          status: itemData.status || { id: crypto.randomUUID(), name: 'Pendente', color: 'bg-gray-500' },
          ...itemData
        };

        group.items.push(clientItem);
      });

      const loadedGroups = Array.from(groupsMap.values());
      console.log('✅ Grupos carregados:', loadedGroups.length);
      setGroups(loadedGroups);
      
      // Transform column data to match expected format
      const formattedColumns = (columnsData || []).map(col => ({
        id: col.column_id,
        name: col.column_name,
        type: col.column_type as 'status' | 'text'
      }));
      
      // Transform status data to match expected format  
      const formattedStatuses = (statusesData || []).map(status => ({
        id: status.status_id,
        name: status.status_name,
        color: status.status_color
      }));
      
      setColumns(formattedColumns);
      setCustomColumns(formattedColumns);
      setStatuses(formattedStatuses);

    } catch (error) {
      console.error('❌ Erro ao carregar dados do Google My Business:', error);
    }
  }, []);

  const saveGoogleMyBusinessToDatabase = async (groups: GoogleMyBusinessGroup[]) => {
    console.log('💾 Salvando dados no banco de dados...');

    try {
      for (const group of groups) {
        for (const item of group.items) {
          const { id, elemento, servicos, informacoes, observacoes, status, ...itemData } = item;

          // Convert status to plain object for JSON compatibility
          const statusObj = {
            id: status.id,
            name: status.name,
            color: status.color
          };

          const { error } = await supabase
            .from('google_my_business_data')
            .update({
              item_data: { elemento, servicos, informacoes, observacoes, status: statusObj, ...itemData },
              updated_at: new Date().toISOString()
            })
            .eq('id', id);

          if (error) {
            console.error('❌ Erro ao salvar no banco:', error);
            throw error;
          }
        }
      }

      console.log('✅ Dados salvos com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar dados no banco de dados:', error);
    }
  };

  const createDefaultData = async () => {
    console.log('📝 Criando dados padrão...');

    try {
      const defaultGroups = [
        { name: 'Janeiro', color: 'bg-red-500' },
        { name: 'Fevereiro', color: 'bg-orange-500' },
        { name: 'Março', color: 'bg-amber-500' },
        { name: 'Abril', color: 'bg-yellow-500' },
        { name: 'Maio', color: 'bg-lime-500' },
        { name: 'Junho', color: 'bg-green-500' },
        { name: 'Julho', color: 'bg-emerald-500' },
        { name: 'Agosto', color: 'bg-teal-500' },
        { name: 'Setembro', color: 'bg-cyan-500' },
        { name: 'Outubro', color: 'bg-sky-500' },
        { name: 'Novembro', color: 'bg-blue-500' },
        { name: 'Dezembro', color: 'bg-indigo-500' }
      ];

      for (const group of defaultGroups) {
        const statusObj = {
          id: crypto.randomUUID(),
          name: 'Pendente',
          color: 'bg-gray-500'
        };

        const { error } = await supabase
          .from('google_my_business_data')
          .insert({
            group_id: crypto.randomUUID(),
            group_name: group.name,
            group_color: group.color,
            item_data: {
              elemento: 'Novo Cliente',
              servicos: 'Serviço Padrão',
              informacoes: 'Informações Padrão',
              status: statusObj
            }
          });

        if (error) {
          console.error('❌ Erro ao criar dados padrão:', error);
          throw error;
        }
      }

      console.log('✅ Dados padrão criados com sucesso');
      await loadGoogleMyBusinessData();

    } catch (error) {
      console.error('❌ Erro ao criar dados padrão:', error);
    }
  };

  const updateGroups = (updatedGroups: GoogleMyBusinessGroup[]) => {
    setGroups(updatedGroups);
    saveGoogleMyBusinessToDatabase(updatedGroups);
  };

  const createMonth = async (monthName: string) => {
    console.log('➕ Criando novo mês:', monthName);
    
    try {
      const newGroupId = crypto.randomUUID();
      
      const statusObj = {
        id: crypto.randomUUID(),
        name: 'Pendente',
        color: 'bg-gray-500'
      };

      const { error } = await supabase
        .from('google_my_business_data')
        .insert({
          group_id: newGroupId,
          group_name: monthName,
          group_color: 'bg-blue-500',
          item_data: {
            elemento: 'Novo Cliente',
            servicos: 'Serviço Padrão',
            informacoes: 'Informações Padrão',
            status: statusObj
          }
        });

      if (error) {
        console.error('❌ Erro ao criar mês:', error);
        throw error;
      }

      console.log('✅ Mês criado com sucesso');
      await loadGoogleMyBusinessData();

    } catch (error) {
      console.error('❌ Erro ao criar mês:', error);
    }
  };

  const updateMonth = async (groupId: string, newMonthName: string) => {
    console.log('📝 Atualizando mês:', groupId, 'para:', newMonthName);
    
    try {
      const updatedGroups = groups.map(group =>
        group.id === groupId ? { ...group, name: newMonthName + ' - Google My Business' } : group
      );
      
      updateGroups(updatedGroups);
      await saveGoogleMyBusinessToDatabase(updatedGroups);

      for (const item of updatedGroups.find(g => g.id === groupId)!.items) {
        const { error } = await supabase
          .from('google_my_business_data')
          .update({
            group_name: newMonthName
          })
          .eq('id', item.id);

        if (error) {
          console.error('❌ Erro ao atualizar nome do grupo nos itens:', error);
          throw error;
        }
      }

      console.log('✅ Mês atualizado com sucesso');
      await loadGoogleMyBusinessData();

    } catch (error) {
      console.error('❌ Erro ao atualizar mês:', error);
    }
  };

  const deleteMonth = async (groupId: string) => {
    console.log('🗑️ Deletando mês:', groupId);
    
    try {
      const groupToDelete = groups.find(group => group.id === groupId);
      if (groupToDelete) {
        for (const item of groupToDelete.items) {
          const { error: itemError } = await supabase
            .from('google_my_business_data')
            .delete()
            .eq('id', item.id);

          if (itemError) {
            console.error('❌ Erro ao deletar item:', item.id, itemError);
            throw itemError;
          }
        }
      }

      await loadGoogleMyBusinessData();
      console.log('✅ Mês deletado com sucesso');

    } catch (error) {
      console.error('❌ Erro ao deletar mês:', error);
    }
  };

  const duplicateMonth = async (groupId: string, newMonthName: string) => {
    console.log(`📄 Duplicando mês ${groupId} para ${newMonthName}`);
    
    try {
      const groupToDuplicate = groups.find(group => group.id === groupId);
      if (!groupToDuplicate) {
        console.warn(`⚠️ Grupo ${groupId} não encontrado`);
        return;
      }

      const newGroupId = crypto.randomUUID();

      for (const item of groupToDuplicate.items) {
        const statusObj = {
          id: item.status.id,
          name: item.status.name,
          color: item.status.color
        };

        const { error } = await supabase
          .from('google_my_business_data')
          .insert({
            group_id: newGroupId,
            group_name: newMonthName,
            group_color: groupToDuplicate.color,
            item_data: {
              elemento: item.elemento,
              servicos: item.servicos,
              informacoes: item.informacoes,
              observacoes: item.observacoes,
              status: statusObj
            }
          });

        if (error) {
          console.error('❌ Erro ao duplicar item:', item, error);
          throw error;
        }
      }

      await loadGoogleMyBusinessData();
      console.log('✅ Mês duplicado com sucesso');

    } catch (error) {
      console.error('❌ Erro ao duplicar mês:', error);
    }
  };

  const addStatus = async (status: Status) => {
    console.log('➕ Adicionando status:', status);
    
    try {
      const { error } = await supabase
        .from('status_config')
        .insert({
          status_id: status.id,
          status_name: status.name,
          status_color: status.color,
          module: 'google_my_business'
        });

      if (error) {
        console.error('❌ Erro ao adicionar status:', error);
        throw error;
      }

      console.log('✅ Status adicionado com sucesso');
      await loadGoogleMyBusinessData();

    } catch (error) {
      console.error('❌ Erro ao adicionar status:', error);
    }
  };

  const updateStatus = async (statusId: string, updates: { name: string; color: string }) => {
    console.log('📝 Atualizando status:', statusId, updates);
    
    try {
      const { error } = await supabase
        .from('status_config')
        .update({
          status_name: updates.name,
          status_color: updates.color
        })
        .eq('status_id', statusId)
        .eq('module', 'google_my_business');

      if (error) {
        console.error('❌ Erro ao atualizar status:', error);
        throw error;
      }

      console.log('✅ Status atualizado com sucesso');
      await loadGoogleMyBusinessData();

    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
    }
  };

  const deleteStatus = async (statusId: string) => {
    console.log('🗑️ Deletando status:', statusId);
    
    try {
      const { error } = await supabase
        .from('status_config')
        .delete()
        .eq('status_id', statusId)
        .eq('module', 'google_my_business');

      if (error) {
        console.error('❌ Erro ao deletar status:', error);
        throw error;
      }

      console.log('✅ Status deletado com sucesso');
      await loadGoogleMyBusinessData();

    } catch (error) {
      console.error('❌ Erro ao deletar status:', error);
    }
  };

  const updateItemStatus = async (itemId: string, field: string, statusId: string) => {
    console.log('📝 Atualizando status do item:', itemId, field, statusId);
    
    try {
      const status = statuses.find(s => s.id === statusId);
      if (!status) return;

      const updatedGroups = groups.map(group => ({
        ...group,
        items: group.items.map(item =>
          item.id === itemId ? { ...item, status: status } : item
        )
      }));

      setGroups(updatedGroups);
      await saveGoogleMyBusinessToDatabase(updatedGroups);

      console.log('✅ Status do item atualizado com sucesso');

    } catch (error) {
      console.error('❌ Erro ao atualizar status do item:', error);
    }
  };

  const addClient = async (groupId: string, client: Omit<GoogleMyBusinessItem, 'id' | 'status'>) => {
    console.log('➕ Adicionando cliente:', client, 'ao grupo:', groupId);
    
    try {
      const newClientId = crypto.randomUUID();
      const group = groups.find(g => g.id === groupId);
      
      const statusObj = {
        id: crypto.randomUUID(),
        name: 'Pendente',
        color: 'bg-gray-500'
      };

      const { error } = await supabase
        .from('google_my_business_data')
        .insert({
          id: newClientId,
          group_id: groupId,
          group_name: group?.name?.replace(' - Google My Business', '') || 'Novo Grupo',
          item_data: {
            elemento: client.elemento,
            servicos: client.servicos,
            informacoes: client.informacoes,
            observacoes: client.observacoes,
            status: statusObj
          }
        });

      if (error) {
        console.error('❌ Erro ao adicionar cliente:', error);
        throw error;
      }

      console.log('✅ Cliente adicionado com sucesso');
      await loadGoogleMyBusinessData();

    } catch (error) {
      console.error('❌ Erro ao adicionar cliente:', error);
    }
  };

  const deleteClient = async (clientId: string) => {
    console.log('🗑️ Deletando cliente:', clientId);
    
    try {
      const { error } = await supabase
        .from('google_my_business_data')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('❌ Erro ao deletar cliente:', error);
        throw error;
      }

      console.log('✅ Cliente deletado com sucesso');
      await loadGoogleMyBusinessData();

    } catch (error) {
      console.error('❌ Erro ao deletar cliente:', error);
    }
  };

  const updateClient = async (clientId: string, updates: any) => {
    console.log('🔄 GMB: Atualizando cliente:', clientId, 'com:', updates);
    
    try {
      const updatedGroups = groups.map(group => ({
        ...group,
        items: group.items.map(item => {
          if (item.id === clientId) {
            const { attachments, ...validUpdates } = updates;
            return { 
              ...item, 
              ...validUpdates
            };
          }
          return item;
        })
      }));

      updateGroups(updatedGroups);
      await saveGoogleMyBusinessToDatabase(updatedGroups);
      
      console.log('✅ GMB: Cliente atualizado com sucesso');
    } catch (error) {
      console.error('❌ GMB: Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const applyDefaultObservationsToAllClients = async (defaultObservations: string) => {
    console.log('📝 Aplicando observações padrão a todos os clientes...');
  
    try {
      const updatedGroups = groups.map(group => ({
        ...group,
        items: group.items.map(item => ({
          ...item,
          observacoes: defaultObservations
        }))
      }));
  
      updateGroups(updatedGroups);
      await saveGoogleMyBusinessToDatabase(updatedGroups);
  
      console.log('✅ Observações padrão aplicadas a todos os clientes com sucesso');
    } catch (error) {
      console.error('❌ Erro ao aplicar observações padrão a todos os clientes:', error);
    }
  };

  useEffect(() => {
    loadGoogleMyBusinessData();
  }, [loadGoogleMyBusinessData]);

  return {
    groups,
    columns,
    customColumns,
    statuses,
    updateGroups,
    createMonth,
    updateMonth: async (groupId: string, newMonthName: string) => {
      console.log('📝 Atualizando mês:', groupId, 'para:', newMonthName);
      
      try {
        const updatedGroups = groups.map(group =>
          group.id === groupId ? { ...group, name: newMonthName + ' - Google My Business' } : group
        );
        
        updateGroups(updatedGroups);
        await saveGoogleMyBusinessToDatabase(updatedGroups);

        for (const item of updatedGroups.find(g => g.id === groupId)!.items) {
          const { error } = await supabase
            .from('google_my_business_data')
            .update({
              group_name: newMonthName
            })
            .eq('id', item.id);

          if (error) {
            console.error('❌ Erro ao atualizar nome do grupo nos itens:', error);
            throw error;
          }
        }

        console.log('✅ Mês atualizado com sucesso');
        await loadGoogleMyBusinessData();

      } catch (error) {
        console.error('❌ Erro ao atualizar mês:', error);
      }
    },
    deleteMonth: async (groupId: string) => {
      console.log('🗑️ Deletando mês:', groupId);
      
      try {
        const groupToDelete = groups.find(group => group.id === groupId);
        if (groupToDelete) {
          for (const item of groupToDelete.items) {
            const { error: itemError } = await supabase
              .from('google_my_business_data')
              .delete()
              .eq('id', item.id);

            if (itemError) {
              console.error('❌ Erro ao deletar item:', item.id, itemError);
              throw itemError;
            }
          }
        }

        await loadGoogleMyBusinessData();
        console.log('✅ Mês deletado com sucesso');

      } catch (error) {
        console.error('❌ Erro ao deletar mês:', error);
      }
    },
    duplicateMonth: async (groupId: string, newMonthName: string) => {
      console.log(`📄 Duplicando mês ${groupId} para ${newMonthName}`);
      
      try {
        const groupToDuplicate = groups.find(group => group.id === groupId);
        if (!groupToDuplicate) {
          console.warn(`⚠️ Grupo ${groupId} não encontrado`);
          return;
        }

        const newGroupId = crypto.randomUUID();

        for (const item of groupToDuplicate.items) {
          const statusObj = {
            id: item.status.id,
            name: item.status.name,
            color: item.status.color
          };

          const { error } = await supabase
            .from('google_my_business_data')
            .insert({
              group_id: newGroupId,
              group_name: newMonthName,
              group_color: groupToDuplicate.color,
              item_data: {
                elemento: item.elemento,
                servicos: item.servicos,
                informacoes: item.informacoes,
                observacoes: item.observacoes,
                status: statusObj
              }
            });

          if (error) {
            console.error('❌ Erro ao duplicar item:', item, error);
            throw error;
          }
        }

        await loadGoogleMyBusinessData();
        console.log('✅ Mês duplicado com sucesso');

      } catch (error) {
        console.error('❌ Erro ao duplicar mês:', error);
      }
    },
    addStatus,
    updateStatus,
    deleteStatus,
    addColumn: async (columnName: string, columnType: 'status' | 'text') => {
      console.log('➕ Adicionando coluna:', columnName, columnType);
      
      try {
        const { error } = await supabase
          .from('column_config')
          .insert({
            column_id: crypto.randomUUID(),
            column_name: columnName,
            column_type: columnType,
            module: 'google_my_business'
          });

        if (error) {
          console.error('❌ Erro ao adicionar coluna:', error);
          throw error;
        }

        console.log('✅ Coluna adicionada com sucesso');
        await loadGoogleMyBusinessData();

      } catch (error) {
        console.error('❌ Erro ao adicionar coluna:', error);
      }
    },
    updateColumn: async (column: Column) => {
      console.log('📝 Atualizando coluna:', column);
      
      try {
        const { error } = await supabase
          .from('column_config')
          .update({
            column_name: column.name,
            column_type: column.type
          })
          .eq('column_id', column.id)
          .eq('module', 'google_my_business');

        if (error) {
          console.error('❌ Erro ao atualizar coluna:', error);
          throw error;
        }

        console.log('✅ Coluna atualizada com sucesso');
        await loadGoogleMyBusinessData();

      } catch (error) {
        console.error('❌ Erro ao atualizar coluna:', error);
      }
    },
    deleteColumn: async (columnId: string) => {
      console.log('🗑️ Deletando coluna:', columnId);
      
      try {
        const { error } = await supabase
          .from('column_config')
          .delete()
          .eq('column_id', columnId)
          .eq('module', 'google_my_business');

        if (error) {
          console.error('❌ Erro ao deletar coluna:', error);
          throw error;
        }

        console.log('✅ Coluna deletada com sucesso');
        await loadGoogleMyBusinessData();

      } catch (error) {
        console.error('❌ Erro ao deletar coluna:', error);
      }
    },
    moveColumnUp: async (columnId: string) => {
      console.log('⬆️ Movendo coluna para cima:', columnId);
      
      try {
        const columnIndex = customColumns.findIndex(column => column.id === columnId);
        if (columnIndex <= 0) return;

        const newColumns = [...customColumns];
        const columnToMove = newColumns.splice(columnIndex, 1)[0];
        newColumns.splice(columnIndex - 1, 0, columnToMove);

        setCustomColumns(newColumns);
        setColumns(newColumns);

        console.log('✅ Coluna movida para cima com sucesso');

      } catch (error) {
        console.error('❌ Erro ao mover coluna para cima:', error);
      }
    },
    moveColumnDown: async (columnId: string) => {
      console.log('⬇️ Movendo coluna para baixo:', columnId);
      
      try {
        const columnIndex = customColumns.findIndex(column => column.id === columnId);
        if (columnIndex >= customColumns.length - 1) return;

        const newColumns = [...customColumns];
        const columnToMove = newColumns.splice(columnIndex, 1)[0];
        newColumns.splice(columnIndex + 1, 0, columnToMove);

        setCustomColumns(newColumns);
        setColumns(newColumns);

        console.log('✅ Coluna movida para baixo com sucesso');

      } catch (error) {
        console.error('❌ Erro ao mover coluna para baixo:', error);
      }
    },
    updateItemStatus,
    addClient,
    deleteClient,
    updateClient,
    getClientFiles: () => [],
    applyDefaultObservationsToAllClients
  };
}
