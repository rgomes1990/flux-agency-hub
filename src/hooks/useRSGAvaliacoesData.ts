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

  useEffect(() => {
    loadRSGAvaliacoesData();
    loadColumns();
    loadStatuses();
  }, []);

  const updateGroups = (updatedGroups: RSGAvaliacoesGroup[]) => {
    setGroups(updatedGroups);
  };

  const loadRSGAvaliacoesData = useCallback(async () => {
    console.log('🔄 Carregando dados do RSG Avaliações...');
    
    try {
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

      const groupsMap = new Map<string, RSGAvaliacoesGroup>();
      const processedItems = new Set<string>();

      data.forEach(item => {
        // Skip if already processed to avoid duplicates
        if (processedItems.has(item.id)) {
          console.log('⚠️ Item duplicado encontrado, pulando:', item.id);
          return;
        }
        processedItems.add(item.id);

        if (!groupsMap.has(item.group_name)) {
          groupsMap.set(item.group_name, {
            id: item.group_id,
            name: item.group_name,
            color: item.group_color || 'bg-purple-500',
            isExpanded: item.is_expanded !== false,
            items: []
          });
        }

        const group = groupsMap.get(item.group_name)!;
        
        // Process item data safely
        let itemData: any = {};
        let status: any = {};
        
        if (item.item_data) {
          try {
            if (typeof item.item_data === 'string') {
              itemData = JSON.parse(item.item_data);
            } else {
              itemData = item.item_data as any;
            }
            status = itemData?.status || {};
          } catch (error) {
            console.warn('⚠️ Erro ao processar item_data:', error);
            itemData = {};
          }
        }

        const rsgItem: RSGAvaliacoesItem = {
          id: item.id,
          elemento: itemData.elemento || '',
          servicos: itemData.servicos || '',
          observacoes: itemData.observacoes || '',
          attachments: itemData.attachments || [],
          status: status,
          ...itemData
        };

        group.items.push(rsgItem);
      });

      const loadedGroups = Array.from(groupsMap.values());
      console.log('✅ Grupos carregados:', loadedGroups.length);
      updateGroups(loadedGroups);

    } catch (error) {
      console.error('❌ Erro ao carregar dados do RSG Avaliações:', error);
    }
  }, []);

  const saveRSGAvaliacoesToDatabase = async (rsgData: RSGAvaliacoesGroup[]) => {
    console.log('💾 Salvando dados no banco de dados...', rsgData);
  
    try {
      // Delete existing data to prevent duplicates
      const { error: deleteError } = await supabase
        .from('rsg_avaliacoes_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) {
        console.error('❌ Erro ao limpar dados antigos:', deleteError);
        throw deleteError;
      }

      // Format data for database
      const formattedData = rsgData.flatMap(group =>
        group.items.map(item => ({
          id: item.id,
          group_id: group.id,
          group_name: group.name,
          group_color: group.color,
          is_expanded: group.isExpanded,
          item_data: item,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      );

      // Insert new data
      if (formattedData.length > 0) {
        const { error: insertError } = await supabase
          .from('rsg_avaliacoes_data')
          .insert(formattedData);

        if (insertError) {
          console.error('❌ Erro ao inserir dados:', insertError);
          throw insertError;
        }
      }

      console.log('✅ Dados salvos com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar dados no banco de dados:', error);
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

  const addStatus = async (status: RSGAvaliacoesStatus) => {
    setStatuses([...statuses, status]);
    // await saveStatusesToDatabase([...statuses, status]);
  };

  const updateStatus = async (updatedStatus: RSGAvaliacoesStatus) => {
    const updatedStatuses = statuses.map(status =>
      status.id === updatedStatus.id ? updatedStatus : status
    );

    setStatuses(updatedStatuses);
    // await saveStatusesToDatabase(updatedStatuses);
  };

  const deleteStatus = async (statusId: string) => {
    const updatedStatuses = statuses.filter(status => status.id !== statusId);
    setStatuses(updatedStatuses);
    // await saveStatusesToDatabase(updatedStatuses);
  };

  const addColumn = async (columnName: string, columnType: 'status' | 'text') => {
    const newColumn = {
      id: crypto.randomUUID(),
      name: columnName,
      type: columnType
    };

    setColumns([...columns, newColumn]);
    // await saveColumnsToDatabase([...columns, newColumn]);
  };

  const updateColumn = async (updatedColumn: RSGAvaliacoesColumn) => {
    const updatedColumns = columns.map(column =>
      column.id === updatedColumn.id ? updatedColumn : column
    );

    setColumns(updatedColumns);
    // await saveColumnsToDatabase(updatedColumns);
  };

  const deleteColumn = async (columnId: string) => {
    const updatedColumns = columns.filter(column => column.id !== columnId);
    setColumns(updatedColumns);
    // await saveColumnsToDatabase(updatedColumns);
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
  };
}
