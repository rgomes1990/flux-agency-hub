import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Status {
  id: string;
  name: string;
  color: string;
  [key: string]: any; // Index signature for Json compatibility
}

export interface GoogleMyBusinessItem {
  id: string;
  elemento: string;
  servicos: string;
  informacoes: string;
  observacoes: string;
  status: Status;
  attachments?: File[];
  [key: string]: any;
}

export interface GoogleMyBusinessGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: GoogleMyBusinessItem[];
}

export interface GoogleMyBusinessColumn {
  id: string;
  name: string;
  type: 'status' | 'text';
}

export function useGoogleMyBusinessData() {
  const [groups, setGroups] = useState<GoogleMyBusinessGroup[]>([]);
  const [columns, setColumns] = useState<GoogleMyBusinessColumn[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoogleMyBusinessData();
    loadColumns();
    loadStatuses();
  }, []);

  const loadDefaultObservations = async (): Promise<Array<{id: string, text: string, completed: boolean}>> => {
    try {
      const { data, error } = await supabase
        .from('default_observations')
        .select('*')
        .eq('module', 'google_my_business')
        .order('order_index', { ascending: true });

      if (error) {
        console.error('❌ Erro ao carregar observações padrões:', error);
        return [];
      }

      if (data) {
        return data.map(obs => ({
          id: crypto.randomUUID(),
          text: obs.text,
          completed: false
        }));
      }

      return [];
    } catch (error) {
      console.error('❌ Erro ao carregar observações padrões:', error);
      return [];
    }
  };

  const saveGoogleMyBusinessToDatabase = async (googleMyBusinessData: GoogleMyBusinessGroup[]) => {
    console.log('💾 GMB: Salvando dados no banco de dados...', googleMyBusinessData);
  
    try {
      setLoading(true);
      
      // Primeiro, deletar todos os dados existentes para evitar duplicação
      const { error: deleteError } = await supabase
        .from('google_my_business_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Condição que sempre será verdadeira
  
      if (deleteError) {
        console.error('❌ GMB: Erro ao limpar dados antigos:', deleteError);
        throw deleteError;
      }

      // Mapear os dados para o formato correto
      const formattedData = googleMyBusinessData.flatMap(group =>
        group.items.map(item => {
          const { id, elemento, servicos, informacoes, observacoes, status, attachments, ...itemData } = item;
          
          return {
            id: id,
            group_id: group.id,
            group_name: group.name,
            group_color: group.color,
            is_expanded: group.isExpanded,
            item_data: JSON.stringify({
              elemento,
              servicos,
              informacoes,
              observacoes,
              status: JSON.parse(JSON.stringify(status)), // Ensure proper serialization
              attachments: attachments || [],
              ...itemData
            }),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        })
      );
  
      // Inserir os novos dados apenas se houver dados para inserir
      if (formattedData.length > 0) {
        const { error: insertError } = await supabase
          .from('google_my_business_data')
          .insert(formattedData);
  
        if (insertError) {
          console.error('❌ GMB: Erro ao inserir dados:', insertError);
          throw insertError;
        }
      }
  
      console.log('✅ GMB: Dados salvos com sucesso!');
    } catch (error) {
      console.error('❌ GMB: Erro ao salvar dados no banco de dados:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadGoogleMyBusinessData = useCallback(async () => {
    console.log('🔄 GMB: Carregando dados...');
    
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('google_my_business_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ GMB: Erro ao carregar dados:', error);
        throw error;
      }

      console.log('📊 GMB: Dados carregados:', data?.length, 'registros');

      if (!data || data.length === 0) {
        console.log('📝 GMB: Nenhum dado encontrado, criando dados padrão...');
        await createDefaultData();
        return;
      }

      const groupsMap = new Map<string, GoogleMyBusinessGroup>();
      const processedItems = new Set<string>(); // Para evitar duplicação

      data.forEach(item => {
        // Evitar processamento de itens duplicados
        if (processedItems.has(item.id)) {
          console.warn('⚠️ GMB: Item duplicado detectado e ignorado:', item.id);
          return;
        }
        processedItems.add(item.id);

        if (!groupsMap.has(item.group_name)) {
          groupsMap.set(item.group_name, {
            id: item.group_id,
            name: item.group_name,
            color: item.group_color || 'bg-blue-500',
            isExpanded: item.is_expanded ?? true,
            items: []
          });
        }

        const group = groupsMap.get(item.group_name)!;
        
        let itemData: any = {};
        if (item.item_data) {
          try {
            if (typeof item.item_data === 'string') {
              itemData = JSON.parse(item.item_data);
            } else {
              itemData = item.item_data as any;
            }
          } catch (error) {
            console.warn('⚠️ GMB: Erro ao processar item_data:', error);
            itemData = {};
          }
        }

        const googleMyBusinessItem: GoogleMyBusinessItem = {
          id: item.id,
          elemento: itemData.elemento || '',
          servicos: itemData.servicos || '',
          informacoes: itemData.informacoes || '',
          observacoes: itemData.observacoes || '',
          status: itemData.status || { id: 'pending', name: 'Pendente', color: '#gray-500' },
          attachments: itemData.attachments || [],
          ...itemData
        };

        // Verificar se o item já existe no grupo antes de adicionar
        const existingItemIndex = group.items.findIndex(existingItem => existingItem.id === googleMyBusinessItem.id);
        if (existingItemIndex === -1) {
          group.items.push(googleMyBusinessItem);
        } else {
          console.warn('⚠️ GMB: Item já existe no grupo, atualizando:', googleMyBusinessItem.id);
          group.items[existingItemIndex] = googleMyBusinessItem;
        }
      });

      const loadedGroups = Array.from(groupsMap.values());
      console.log('✅ GMB: Grupos carregados:', loadedGroups.length);
      setGroups(loadedGroups);

    } catch (error) {
      console.error('❌ GMB: Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGroups = (updatedGroups: GoogleMyBusinessGroup[]) => {
    setGroups(updatedGroups);
  };

  const createMonth = async (monthName: string) => {
    const newGroupId = crypto.randomUUID();
    const newGroup: GoogleMyBusinessGroup = {
      id: newGroupId,
      name: `${monthName} - GMB`,
      color: 'bg-blue-500',
      isExpanded: true,
      items: []
    };

    setGroups([...groups, newGroup]);
    await saveGoogleMyBusinessToDatabase([...groups, newGroup]);
  };

  const updateMonth = async (groupId: string, newMonthName: string) => {
    const updatedGroups = groups.map(group =>
      group.id === groupId ? { ...group, name: `${newMonthName} - GMB` } : group
    );

    setGroups(updatedGroups);
    await saveGoogleMyBusinessToDatabase(updatedGroups);
  };

  const deleteMonth = async (groupId: string) => {
    const updatedGroups = groups.filter(group => group.id !== groupId);
    setGroups(updatedGroups);
    await saveGoogleMyBusinessToDatabase(updatedGroups);
  };

  const duplicateMonth = async (groupId: string, newMonthName: string) => {
    const groupToDuplicate = groups.find(group => group.id === groupId);
    if (!groupToDuplicate) return;
  
    const newGroupId = crypto.randomUUID();
    const duplicatedGroup: GoogleMyBusinessGroup = {
      id: newGroupId,
      name: `${newMonthName} - GMB`,
      color: groupToDuplicate.color,
      isExpanded: true,
      items: groupToDuplicate.items.map(item => ({
        ...item,
        id: crypto.randomUUID()
      }))
    };
  
    const updatedGroups = [...groups, duplicatedGroup];
    setGroups(updatedGroups);
    await saveGoogleMyBusinessToDatabase(updatedGroups);
  };

  const addStatus = async (status: Status) => {
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

    setColumns([...columns, newColumn]);
    await saveColumnsToDatabase([...columns, newColumn]);
  };

  const updateColumn = async (updatedColumn: GoogleMyBusinessColumn) => {
    const updatedColumns = columns.map(column =>
      column.id === updatedColumn.id ? updatedColumn : column
    );

    setColumns(updatedColumns);
    await saveColumnsToDatabase(updatedColumns);
  };

  const deleteColumn = async (columnId: string) => {
    const updatedColumns = columns.filter(column => column.id !== columnId);
    setColumns(updatedColumns);
    await saveColumnsToDatabase(updatedColumns);
  };

  const moveColumnUp = async (columnId: string) => {
    const columnIndex = columns.findIndex(column => column.id === columnId);
    if (columnIndex <= 0) return;

    const newColumns = [...columns];
    const temp = newColumns[columnIndex];
    newColumns[columnIndex] = newColumns[columnIndex - 1];
    newColumns[columnIndex - 1] = temp;

    setColumns(newColumns);
    await saveColumnsToDatabase(newColumns);
  };

  const moveColumnDown = async (columnId: string) => {
    const columnIndex = columns.findIndex(column => column.id === columnId);
    if (columnIndex >= columns.length - 1) return;

    const newColumns = [...columns];
    const temp = newColumns[columnIndex];
    newColumns[columnIndex] = newColumns[columnIndex + 1];
    newColumns[columnIndex + 1] = temp;

    setColumns(newColumns);
    await saveColumnsToDatabase(newColumns);
  };

  const updateClient = async (clientId: string, updates: any) => {
    console.log('🔄 GMB: Atualizando cliente:', clientId, 'com:', updates);
    
    try {
      const updatedGroups = groups.map(group => ({
        ...group,
        items: group.items.map(item => {
          if (item.id === clientId) {
            return { 
              ...item, 
              ...updates
            };
          }
          return item;
        })
      }));

      setGroups(updatedGroups);
      await saveGoogleMyBusinessToDatabase(updatedGroups);
      
      console.log('✅ GMB: Cliente atualizado com sucesso');
    } catch (error) {
      console.error('❌ GMB: Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const addClient = async (groupId: string, client: Omit<GoogleMyBusinessItem, 'id'>) => {
    const newClientId = crypto.randomUUID();
    
    // Carregar observações padrões
    const defaultObservations = await loadDefaultObservations();
    
    const newClient: GoogleMyBusinessItem = {
      id: newClientId,
      elemento: client.elemento || '',
      servicos: client.servicos || '',
      informacoes: client.informacoes || '',
      observacoes: JSON.stringify(defaultObservations),
      status: client.status || { id: 'pending', name: 'Pendente', color: '#gray-500' },
      attachments: client.attachments || [],
      ...client
    };

    const updatedGroups = groups.map(group =>
      group.id === groupId ? { ...group, items: [...group.items, newClient] } : group
    );

    setGroups(updatedGroups);
    await saveGoogleMyBusinessToDatabase(updatedGroups);
  };

  const deleteClient = async (clientId: string) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== clientId)
    }));

    setGroups(updatedGroups);
    await saveGoogleMyBusinessToDatabase(updatedGroups);
  };

  const updateItemStatus = async (itemId: string, status: Status) => {
    console.log('🔄 GMB: Atualizando status do item:', itemId, 'para:', status);
    
    try {
      const updatedGroups = groups.map(group => ({
        ...group,
        items: group.items.map(item => {
          if (item.id === itemId) {
            return { ...item, status: status };
          }
          return item;
        })
      }));

      setGroups(updatedGroups);
      await saveGoogleMyBusinessToDatabase(updatedGroups);
      
      console.log('✅ GMB: Status atualizado com sucesso');
    } catch (error) {
      console.error('❌ GMB: Erro ao atualizar status:', error);
      throw error;
    }
  };

  const createDefaultData = async () => {
    const defaultGroups: GoogleMyBusinessGroup[] = [
      {
        id: crypto.randomUUID(),
        name: 'Janeiro - GMB',
        color: 'bg-blue-500',
        isExpanded: true,
        items: []
      },
      {
        id: crypto.randomUUID(),
        name: 'Fevereiro - GMB',
        color: 'bg-green-500',
        isExpanded: true,
        items: []
      },
      {
        id: crypto.randomUUID(),
        name: 'Março - GMB',
        color: 'bg-red-500',
        isExpanded: true,
        items: []
      }
    ];

    setGroups(defaultGroups);
    await saveGoogleMyBusinessToDatabase(defaultGroups);
  };

  const loadColumns = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'google_my_business')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar colunas:', error);
        return;
      }

      if (data) {
        const typedColumns = data.map(col => ({
          id: col.status_id,
          name: col.status_name,
          type: 'status' as const
        }));
        setColumns(typedColumns);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar colunas:', error);
    }
  }, []);

  const loadStatuses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'google_my_business')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar status:', error);
        return;
      }

      if (data) {
        const typedStatuses = data.map(status => ({
          id: status.status_id,
          name: status.status_name,
          color: status.status_color
        }));
        setStatuses(typedStatuses);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar status:', error);
    }
  }, []);

  const saveColumnsToDatabase = async (columns: GoogleMyBusinessColumn[]) => {
    console.log('💾 Salvando colunas no banco de dados...', columns);

    try {
      // Delete existing columns for this module
      const { error: deleteError } = await supabase
        .from('status_config')
        .delete()
        .eq('module', 'google_my_business');

      if (deleteError) {
        console.error('❌ Erro ao limpar colunas antigas:', deleteError);
        throw deleteError;
      }

      // Insert new columns
      const formattedColumns = columns.map(column => ({
        status_id: column.id,
        status_name: column.name,
        status_color: '#3b82f6',
        module: 'google_my_business'
      }));

      if (formattedColumns.length > 0) {
        const { error: insertError } = await supabase
          .from('status_config')
          .insert(formattedColumns);

        if (insertError) {
          console.error('❌ Erro ao inserir colunas:', insertError);
          throw insertError;
        }
      }

      console.log('✅ Colunas salvas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar colunas no banco de dados:', error);
    }
  };

  const saveStatusesToDatabase = async (statuses: Status[]) => {
    console.log('💾 Salvando status no banco de dados...', statuses);

    try {
      // Delete existing statuses for this module
      const { error: deleteError } = await supabase
        .from('status_config')
        .delete()
        .eq('module', 'google_my_business');

      if (deleteError) {
        console.error('❌ Erro ao limpar status antigos:', deleteError);
        throw deleteError;
      }

      // Insert new statuses
      const formattedStatuses = statuses.map(status => ({
        status_id: status.id,
        status_name: status.name,
        status_color: status.color,
        module: 'google_my_business'
      }));

      if (formattedStatuses.length > 0) {
        const { error: insertError } = await supabase
          .from('status_config')
          .insert(formattedStatuses);

        if (insertError) {
          console.error('❌ Erro ao inserir status:', insertError);
          throw insertError;
        }
      }

      console.log('✅ Status salvos com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar status no banco de dados:', error);
    }
  };

  return {
    groups,
    columns,
    statuses,
    loading,
    updateGroups: setGroups,
    createMonth: async (monthName: string) => {
      const newGroupId = crypto.randomUUID();
      const newGroup: GoogleMyBusinessGroup = {
        id: newGroupId,
        name: `${monthName} - GMB`,
        color: 'bg-blue-500',
        isExpanded: true,
        items: []
      };

      const updatedGroups = [...groups, newGroup];
      setGroups(updatedGroups);
      await saveGoogleMyBusinessToDatabase(updatedGroups);
    },
    updateMonth: async (groupId: string, newMonthName: string) => {
      const updatedGroups = groups.map(group =>
        group.id === groupId ? { ...group, name: `${newMonthName} - GMB` } : group
      );

      setGroups(updatedGroups);
      await saveGoogleMyBusinessToDatabase(updatedGroups);
    },
    deleteMonth: async (groupId: string) => {
      const updatedGroups = groups.filter(group => group.id !== groupId);
      setGroups(updatedGroups);
      await saveGoogleMyBusinessToDatabase(updatedGroups);
    },
    duplicateMonth: async (groupId: string, newMonthName: string) => {
      const groupToDuplicate = groups.find(group => group.id === groupId);
      if (!groupToDuplicate) return;
    
      const newGroupId = crypto.randomUUID();
      const duplicatedGroup: GoogleMyBusinessGroup = {
        id: newGroupId,
        name: `${newMonthName} - GMB`,
        color: groupToDuplicate.color,
        isExpanded: true,
        items: groupToDuplicate.items.map(item => ({
          ...item,
          id: crypto.randomUUID()
        }))
      };
    
      const updatedGroups = [...groups, duplicatedGroup];
      setGroups(updatedGroups);
      await saveGoogleMyBusinessToDatabase(updatedGroups);
    },
    addStatus: async (status: Status) => {
      setStatuses([...statuses, status]);
      await saveStatusesToDatabase([...statuses, status]);
    },
    updateStatus: async (statusId: string, updates: { name: string; color: string }) => {
      const updatedStatuses = statuses.map(status =>
        status.id === statusId ? { ...status, ...updates } : status
      );

      setStatuses(updatedStatuses);
      await saveStatusesToDatabase(updatedStatuses);
    },
    deleteStatus: async (statusId: string) => {
      const updatedStatuses = statuses.filter(status => status.id !== statusId);
      setStatuses(updatedStatuses);
      await saveStatusesToDatabase(updatedStatuses);
    },
    addColumn: async (columnName: string, columnType: 'status' | 'text') => {
      const newColumn = {
        id: crypto.randomUUID(),
        name: columnName,
        type: columnType
      };

      setColumns([...columns, newColumn]);
      await saveColumnsToDatabase([...columns, newColumn]);
    },
    updateColumn: async (updatedColumn: GoogleMyBusinessColumn) => {
      const updatedColumns = columns.map(column =>
        column.id === updatedColumn.id ? updatedColumn : column
      );

      setColumns(updatedColumns);
      await saveColumnsToDatabase(updatedColumns);
    },
    deleteColumn: async (columnId: string) => {
      const updatedColumns = columns.filter(column => column.id !== columnId);
      setColumns(updatedColumns);
      await saveColumnsToDatabase(updatedColumns);
    },
    moveColumnUp: async (columnId: string) => {
      const columnIndex = columns.findIndex(column => column.id === columnId);
      if (columnIndex <= 0) return;

      const newColumns = [...columns];
      const temp = newColumns[columnIndex];
      newColumns[columnIndex] = newColumns[columnIndex - 1];
      newColumns[columnIndex - 1] = temp;

      setColumns(newColumns);
      await saveColumnsToDatabase(newColumns);
    },
    moveColumnDown: async (columnId: string) => {
      const columnIndex = columns.findIndex(column => column.id === columnId);
      if (columnIndex >= columns.length - 1) return;

      const newColumns = [...columns];
      const temp = newColumns[columnIndex];
      newColumns[columnIndex] = newColumns[columnIndex + 1];
      newColumns[columnIndex + 1] = temp;

      setColumns(newColumns);
      await saveColumnsToDatabase(newColumns);
    },
    updateItemStatus,
    addClient,
    deleteClient,
    updateClient,
    getClientFiles: (clientId: string) => {
      const client = groups.flatMap(group => group.items).find(item => item.id === clientId);
      return client?.attachments || [];
    }
  };
}
