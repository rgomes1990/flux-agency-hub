import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TrafficItem {
  id: string;
  elemento: string;
  servicos: string;
  observacoes: string;
  attachments?: Array<{ name: string; data: string; type: string; size?: number }>;
  status?: {
    id?: string;
    name?: string;
    color?: string;
  };
  [key: string]: any;
}

export interface TrafficGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: TrafficItem[];
}

export interface TrafficColumn {
  id: string;
  name: string;
  type: 'status' | 'text';
}

export interface TrafficStatus {
  id: string;
  name: string;
  color: string;
}

export function useTrafficData() {
  const [groups, setGroups] = useState<TrafficGroup[]>([]);
  const [columns, setColumns] = useState<TrafficColumn[]>([]);
  const [statuses, setStatuses] = useState<TrafficStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTrafficData();
    loadColumns();
    loadStatuses();
  }, []);

  const updateGroups = (updatedGroups: TrafficGroup[]) => {
    setGroups(updatedGroups);
  };

  const loadTrafficData = useCallback(async () => {
    if (isLoading) return; // Prevent concurrent loads
    
    console.log('🔄 Carregando dados do Tráfego Pago...');
    setIsLoading(true);
    
    try {
      // Clear existing data first to prevent mixing old and new
      setGroups([]);
      
      const { data, error } = await supabase
        .from('traffic_data')
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

      // Use a more robust deduplication strategy
      const groupsMap = new Map<string, TrafficGroup>();
      const processedItemIds = new Set<string>();
      const processedGroupItems = new Map<string, Set<string>>();

      data.forEach(record => {
        // Skip duplicate records entirely
        const recordKey = `${record.group_id}-${record.id}`;
        if (processedItemIds.has(recordKey)) {
          console.log('⚠️ Registro duplicado ignorado:', recordKey);
          return;
        }
        processedItemIds.add(recordKey);

        // Initialize group if not exists
        if (!groupsMap.has(record.group_id)) {
          groupsMap.set(record.group_id, {
            id: record.group_id,
            name: record.group_name,
            color: record.group_color || 'bg-red-500',
            isExpanded: record.is_expanded !== false,
            items: []
          });
          processedGroupItems.set(record.group_id, new Set<string>());
        }

        const group = groupsMap.get(record.group_id)!;
        const groupItemIds = processedGroupItems.get(record.group_id)!;
        
        // Process item data safely
        let itemData: any = {};
        
        if (record.item_data) {
          try {
            if (typeof record.item_data === 'string') {
              itemData = JSON.parse(record.item_data);
            } else {
              itemData = record.item_data as any;
            }
          } catch (error) {
            console.warn('⚠️ Erro ao processar item_data:', error);
            return; // Skip malformed data
          }
        }

        // Skip if item already processed in this group
        const itemId = itemData.id || record.id;
        if (groupItemIds.has(itemId)) {
          console.log('⚠️ Item duplicado no grupo ignorado:', itemId);
          return;
        }
        groupItemIds.add(itemId);

        const trafficItem: TrafficItem = {
          id: itemId,
          elemento: itemData.elemento || '',
          servicos: itemData.servicos || '',
          observacoes: itemData.observacoes || '',
          attachments: itemData.attachments || [],
          status: itemData.status || {},
          ...itemData
        };

        group.items.push(trafficItem);
      });

      const loadedGroups = Array.from(groupsMap.values());
      console.log('✅ Grupos carregados:', loadedGroups.length);
      console.log('📊 Itens por grupo:', loadedGroups.map(g => ({ name: g.name, count: g.items.length })));
      
      updateGroups(loadedGroups);

    } catch (error) {
      console.error('❌ Erro ao carregar dados do Tráfego Pago:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const saveTrafficToDatabase = async (trafficData: TrafficGroup[]) => {
    console.log('💾 Salvando dados no banco de dados...', trafficData);
  
    try {
      // Use transaction-like approach: delete all, then insert all
      // First, delete ALL existing traffic data
      const { error: deleteError } = await supabase
        .from('traffic_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all real records

      if (deleteError) {
        console.error('❌ Erro ao limpar dados antigos:', deleteError);
        throw deleteError;
      }

      // Format and insert all data at once
      const formattedData = trafficData.flatMap(group =>
        group.items.length > 0 
          ? group.items.map(item => ({
              id: crypto.randomUUID(), // Always use new UUID for database record
              group_id: group.id,
              group_name: group.name,
              group_color: group.color,
              is_expanded: group.isExpanded,
              item_data: item,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))
          : [{
              id: crypto.randomUUID(),
              group_id: group.id,
              group_name: group.name,
              group_color: group.color,
              is_expanded: group.isExpanded,
              item_data: {
                id: `empty-${group.id}`,
                elemento: '',
                servicos: '',
                observacoes: '',
                attachments: []
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]
      );

      // Insert new data in batches to avoid conflicts
      if (formattedData.length > 0) {
        const batchSize = 50;
        for (let i = 0; i < formattedData.length; i += batchSize) {
          const batch = formattedData.slice(i, i + batchSize);
          const { error: insertError } = await supabase
            .from('traffic_data')
            .insert(batch);

          if (insertError) {
            console.error('❌ Erro ao inserir lote:', insertError);
            throw insertError;
          }
        }
      }

      console.log('✅ Dados salvos com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar dados no banco de dados:', error);
      throw error;
    }
  };

  const createDefaultData = async () => {
    const defaultGroups: TrafficGroup[] = [
      {
        id: crypto.randomUUID(),
        name: 'Janeiro - TRÁFEGO PAGO',
        color: 'bg-red-500',
        isExpanded: true,
        items: []
      }
    ];

    setGroups(defaultGroups);
    await saveTrafficToDatabase(defaultGroups);
  };

  const createMonth = async (monthName: string) => {
    const newGroupId = crypto.randomUUID();
    const newGroup: TrafficGroup = {
      id: newGroupId,
      name: `${monthName} - TRÁFEGO PAGO`,
      color: 'bg-red-500',
      isExpanded: true,
      items: []
    };

    setGroups([...groups, newGroup]);
    await saveTrafficToDatabase([...groups, newGroup]);
  };

  const updateMonth = async (groupId: string, newMonthName: string) => {
    const updatedGroups = groups.map(group =>
      group.id === groupId ? { ...group, name: `${newMonthName} - TRÁFEGO PAGO` } : group
    );

    setGroups(updatedGroups);
    await saveTrafficToDatabase(updatedGroups);
  };

  const deleteMonth = async (groupId: string) => {
    const updatedGroups = groups.filter(group => group.id !== groupId);
    setGroups(updatedGroups);
    await saveTrafficToDatabase(updatedGroups);
  };

  const duplicateMonth = async (groupId: string, newMonthName: string) => {
    const groupToDuplicate = groups.find(group => group.id === groupId);
    if (!groupToDuplicate) return;
  
    const newGroupId = crypto.randomUUID();
    const duplicatedGroup: TrafficGroup = {
      id: newGroupId,
      name: `${newMonthName} - TRÁFEGO PAGO`,
      color: groupToDuplicate.color,
      isExpanded: true,
      items: groupToDuplicate.items.map(item => ({
        ...item,
        id: crypto.randomUUID(),
        elemento: item.elemento || '',
        servicos: item.servicos || '',
        observacoes: item.observacoes || ''
      }))
    };
  
    const updatedGroups = [...groups, duplicatedGroup];
    setGroups(updatedGroups);
    await saveTrafficToDatabase(updatedGroups);
  };

  const addClient = async (groupId: string, client: Omit<TrafficItem, 'id'>) => {
    const newClientId = crypto.randomUUID();
    const newClient: TrafficItem = {
      id: newClientId,
      elemento: client.elemento || '',
      servicos: client.servicos || '',
      observacoes: client.observacoes || '',
      ...client
    };

    const updatedGroups = groups.map(group =>
      group.id === groupId ? { ...group, items: [...group.items, newClient] } : group
    );

    setGroups(updatedGroups);
    await saveTrafficToDatabase(updatedGroups);
  };

  const deleteClient = async (clientId: string) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== clientId)
    }));

    setGroups(updatedGroups);
    await saveTrafficToDatabase(updatedGroups);
  };

  const updateClient = async (clientId: string, updates: any) => {
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
    await saveTrafficToDatabase(updatedGroups);
  };

  const loadColumns = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'traffic')
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
        .eq('module', 'traffic')
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

  const addStatus = async (name: string, color: string) => {
    const newStatus: TrafficStatus = {
      id: crypto.randomUUID(),
      name,
      color
    };
    setStatuses([...statuses, newStatus]);
  };

  const updateStatus = async (statusId: string, name: string, color: string) => {
    const updatedStatuses = statuses.map(status =>
      status.id === statusId ? { ...status, name, color } : status
    );
    setStatuses(updatedStatuses);
  };

  const deleteStatus = async (statusId: string) => {
    const updatedStatuses = statuses.filter(status => status.id !== statusId);
    setStatuses(updatedStatuses);
  };

  const addColumn = async (columnName: string, columnType: 'status' | 'text') => {
    const newColumn = {
      id: crypto.randomUUID(),
      name: columnName,
      type: columnType
    };
    setColumns([...columns, newColumn]);
  };

  const updateColumn = async (updatedColumn: TrafficColumn) => {
    const updatedColumns = columns.map(column =>
      column.id === updatedColumn.id ? updatedColumn : column
    );
    setColumns(updatedColumns);
  };

  const deleteColumn = async (columnId: string) => {
    const updatedColumns = columns.filter(column => column.id !== columnId);
    setColumns(updatedColumns);
  };

  const moveColumnUp = (columnId: string) => {
    const currentIndex = columns.findIndex(col => col.id === columnId);
    if (currentIndex > 0) {
      const newColumns = [...columns];
      [newColumns[currentIndex - 1], newColumns[currentIndex]] = [newColumns[currentIndex], newColumns[currentIndex - 1]];
      setColumns(newColumns);
    }
  };

  const moveColumnDown = (columnId: string) => {
    const currentIndex = columns.findIndex(col => col.id === columnId);
    if (currentIndex < columns.length - 1) {
      const newColumns = [...columns];
      [newColumns[currentIndex], newColumns[currentIndex + 1]] = [newColumns[currentIndex + 1], newColumns[currentIndex]];
      setColumns(newColumns);
    }
  };

  const updateItemStatus = async (itemId: string, field: string, statusId: string) => {
    const status = statuses.find(s => s.id === statusId);
    if (!status) return;

    const updatedGroups = groups.map(group => ({
      ...group,
      items: group.items.map(item => {
        if (item.id === itemId) {
          return { ...item, [field]: status };
        }
        return item;
      })
    }));

    setGroups(updatedGroups);
    await saveTrafficToDatabase(updatedGroups);
  };

  const getClientFiles = (clientId: string): File[] => {
    return [];
  };

  return {
    groups,
    columns,
    customColumns: columns,
    statuses,
    updateGroups,
    createMonth,
    updateMonth,
    deleteMonth,
    duplicateMonth,
    addClient,
    deleteClient,
    updateClient,
    addStatus,
    updateStatus,
    deleteStatus,
    addColumn,
    updateColumn,
    deleteColumn,
    moveColumnUp,
    moveColumnDown,
    updateItemStatus,
    getClientFiles
  };
}
