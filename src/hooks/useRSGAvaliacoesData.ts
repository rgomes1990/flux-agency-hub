import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RSGAvaliacoesItem {
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

export interface RSGAvaliacoesGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: RSGAvaliacoesItem[];
}

export interface RSGAvaliacoesColumn {
  id: string;
  name: string;
  type: 'status' | 'text';
}

export interface RSGAvaliacoesStatus {
  id: string;
  name: string;
  color: string;
}

export default function useRSGAvaliacoesData() {
  const [groups, setGroups] = useState<RSGAvaliacoesGroup[]>([]);
  const [columns, setColumns] = useState<RSGAvaliacoesColumn[]>([]);
  const [statuses, setStatuses] = useState<RSGAvaliacoesStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRSGAvaliacoesData();
    loadColumns();
    loadStatuses();
  }, []);

  const updateGroups = (updatedGroups: RSGAvaliacoesGroup[]) => {
    setGroups(updatedGroups);
  };

  const loadRSGAvaliacoesData = useCallback(async () => {
    if (isLoading) return; // Prevent concurrent loads
    
    console.log('🔄 Carregando dados do RSG Avaliações...');
    setIsLoading(true);
    
    try {
      // Clear existing data first
      setGroups([]);
      
      const { data, error } = await supabase
        .from('rsg_avaliacoes_data')
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

      // Enhanced deduplication strategy
      const groupsMap = new Map<string, RSGAvaliacoesGroup>();
      const processedRecordIds = new Set<string>();
      const processedGroupItems = new Map<string, Set<string>>();

      data.forEach(record => {
        // Skip duplicate database records
        const recordKey = `${record.group_id}-${record.id}`;
        if (processedRecordIds.has(recordKey)) {
          console.log('⚠️ Registro duplicado ignorado:', recordKey);
          return;
        }
        processedRecordIds.add(recordKey);

        // Initialize group tracking
        if (!groupsMap.has(record.group_id)) {
          groupsMap.set(record.group_id, {
            id: record.group_id,
            name: record.group_name,
            color: record.group_color || 'bg-purple-500',
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

        // Prevent item duplication within group
        const itemId = itemData.id || record.id;
        if (groupItemIds.has(itemId)) {
          console.log('⚠️ Item duplicado no grupo ignorado:', itemId);
          return;
        }
        groupItemIds.add(itemId);

        const rsgItem: RSGAvaliacoesItem = {
          id: itemId,
          elemento: itemData.elemento || '',
          servicos: itemData.servicos || '',
          observacoes: itemData.observacoes || '',
          attachments: itemData.attachments || [],
          status: itemData.status || {},
          ...itemData
        };

        group.items.push(rsgItem);
      });

      const loadedGroups = Array.from(groupsMap.values());
      console.log('✅ Grupos RSG carregados:', loadedGroups.length);
      console.log('📊 Itens por grupo RSG:', loadedGroups.map(g => ({ name: g.name, count: g.items.length })));
      
      updateGroups(loadedGroups);

    } catch (error) {
      console.error('❌ Erro ao carregar dados do RSG Avaliações:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const saveRSGAvaliacoesToDatabase = async (rsgData: RSGAvaliacoesGroup[]) => {
    console.log('💾 Salvando dados RSG no banco de dados...', rsgData);
  
    try {
      // Delete all existing data first
      const { error: deleteError } = await supabase
        .from('rsg_avaliacoes_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) {
        console.error('❌ Erro ao limpar dados RSG antigos:', deleteError);
        throw deleteError;
      }

      // Format and batch insert
      const formattedData = rsgData.flatMap(group =>
        group.items.length > 0
          ? group.items.map(item => ({
              id: crypto.randomUUID(),
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

      // Insert in batches
      if (formattedData.length > 0) {
        const batchSize = 50;
        for (let i = 0; i < formattedData.length; i += batchSize) {
          const batch = formattedData.slice(i, i + batchSize);
          const { error: insertError } = await supabase
            .from('rsg_avaliacoes_data')
            .insert(batch);

          if (insertError) {
            console.error('❌ Erro ao inserir lote RSG:', insertError);
            throw insertError;
          }
        }
      }

      console.log('✅ Dados RSG salvos com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar dados RSG no banco de dados:', error);
      throw error;
    }
  };

  const createDefaultData = async () => {
    const defaultGroups: RSGAvaliacoesGroup[] = [
      {
        id: crypto.randomUUID(),
        name: 'Janeiro - RSG AVALIAÇÕES',
        color: 'bg-purple-500',
        isExpanded: true,
        items: []
      }
    ];

    setGroups(defaultGroups);
    await saveRSGAvaliacoesToDatabase(defaultGroups);
  };

  const createMonth = async (monthName: string) => {
    const newGroupId = crypto.randomUUID();
    const newGroup: RSGAvaliacoesGroup = {
      id: newGroupId,
      name: `${monthName} - RSG AVALIAÇÕES`,
      color: 'bg-purple-500',
      isExpanded: true,
      items: []
    };

    setGroups([...groups, newGroup]);
    await saveRSGAvaliacoesToDatabase([...groups, newGroup]);
  };

  const updateMonth = async (groupId: string, newMonthName: string) => {
    const updatedGroups = groups.map(group =>
      group.id === groupId ? { ...group, name: `${newMonthName} - RSG AVALIAÇÕES` } : group
    );

    setGroups(updatedGroups);
    await saveRSGAvaliacoesToDatabase(updatedGroups);
  };

  const deleteMonth = async (groupId: string) => {
    const updatedGroups = groups.filter(group => group.id !== groupId);
    setGroups(updatedGroups);
    await saveRSGAvaliacoesToDatabase(updatedGroups);
  };

  const duplicateMonth = async (groupId: string, newMonthName: string) => {
    const groupToDuplicate = groups.find(group => group.id === groupId);
    if (!groupToDuplicate) return;
  
    const newGroupId = crypto.randomUUID();
    const duplicatedGroup: RSGAvaliacoesGroup = {
      id: newGroupId,
      name: `${newMonthName} - RSG AVALIAÇÕES`,
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
    await saveRSGAvaliacoesToDatabase(updatedGroups);
  };

  const addClient = async (groupId: string, client: Omit<RSGAvaliacoesItem, 'id'>) => {
    const newClientId = crypto.randomUUID();
    const newClient: RSGAvaliacoesItem = {
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
    await saveRSGAvaliacoesToDatabase(updatedGroups);
  };

  const deleteClient = async (clientId: string) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== clientId)
    }));

    setGroups(updatedGroups);
    await saveRSGAvaliacoesToDatabase(updatedGroups);
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
    await saveRSGAvaliacoesToDatabase(updatedGroups);
  };

  const addStatus = async (name: string, color: string) => {
    const newStatus: RSGAvaliacoesStatus = {
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

  const updateColumn = async (updatedColumn: RSGAvaliacoesColumn) => {
    const updatedColumns = columns.map(column =>
      column.id === updatedColumn.id ? updatedColumn : column
    );
    setColumns(updatedColumns);
  };

  const deleteColumn = async (columnId: string) => {
    const updatedColumns = columns.filter(column => column.id !== columnId);
    setColumns(updatedColumns);
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
    await saveRSGAvaliacoesToDatabase(updatedGroups);
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

  const loadColumns = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'rsg_avaliacoes')
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
        .eq('module', 'rsg_avaliacoes')
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
    updateItemStatus,
    moveColumnUp,
    moveColumnDown,
  };
}
