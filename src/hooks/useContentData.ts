import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDataProtection } from './useDataProtection';

export interface ContentItem {
  id: string;
  elemento: string;
  servicos: string;
  observacoes: string;
  hasAttachments?: boolean; // Apenas indicador se tem anexos
  attachments?: any[]; // Para quando carregados sob demanda
  status?: {
    id?: string;
    name?: string;
    color?: string;
  };
  [key: string]: any;
}

export interface ContentGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: ContentItem[];
}

export interface ContentColumn {
  id: string;
  name: string;
  type: 'status' | 'text';
}

export interface ContentStatus {
  id: string;
  name: string;
  color: string;
}

export function useContentData() {
  const [groups, setGroups] = useState<ContentGroup[]>([]);
  const [columns, setColumns] = useState<ContentColumn[]>([]);
  const [customColumns, setCustomColumns] = useState<ContentColumn[]>([]);
  const [statuses, setStatuses] = useState<ContentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { safeDataOperation } = useDataProtection();

  useEffect(() => {
    loadContentData();
    loadColumns();
    loadStatuses();
  }, []);

  const updateGroups = (updatedGroups: ContentGroup[]) => {
    setGroups(updatedGroups);
  };

  // Função otimizada para carregar dados SEM anexos
  const loadContentData = useCallback(async () => {
    console.log('🔄 CONTENT: Carregando dados otimizados...');
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('content_data')
        .select('id, group_id, group_name, group_color, elemento, servicos, observacoes, item_data, attachments, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ CONTENT: Erro ao carregar dados:', error);
        throw error;
      }

      console.log('📊 CONTENT: Dados carregados:', data?.length, 'registros');

      if (!data || data.length === 0) {
        console.log('📝 CONTENT: Criando dados padrão...');
        await createDefaultData();
        return;
      }

      const groupsMap = new Map<string, ContentGroup>();
      const processedItems = new Set<string>();

      data.forEach(item => {
        if (processedItems.has(item.id)) {
          return;
        }
        processedItems.add(item.id);

        if (!groupsMap.has(item.group_name)) {
          groupsMap.set(item.group_name, {
            id: item.group_id,
            name: item.group_name,
            color: item.group_color || 'bg-blue-500',
            isExpanded: true,
            items: []
          });
        }

        const group = groupsMap.get(item.group_name)!;
        
        // Apenas verificar SE tem anexos, não carregar os dados
        const hasAttachments = item.attachments && 
          ((Array.isArray(item.attachments) && item.attachments.length > 0) || 
           (typeof item.attachments === 'string' && item.attachments.trim() !== ''));

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
            console.warn('⚠️ CONTENT: Erro ao processar item_data:', error);
            itemData = {};
          }
        }

        const contentItem: ContentItem = {
          id: item.id,
          elemento: item.elemento || '',
          servicos: item.servicos || '',
          observacoes: item.observacoes || '',
          hasAttachments: !!hasAttachments, // Apenas indicador booleano
          status: status,
          ...itemData
        };

        console.log('📝 CONTENT: Item carregado:', contentItem.elemento, hasAttachments ? '(com anexos)' : '(sem anexos)');
        group.items.push(contentItem);
      });

      const loadedGroups = Array.from(groupsMap.values());
      console.log('✅ CONTENT: Grupos carregados:', loadedGroups.length);
      updateGroups(loadedGroups);

    } catch (error) {
      console.error('❌ CONTENT: Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função separada para carregar anexos de um cliente específico
  const loadClientAttachments = useCallback(async (clientId: string) => {
    console.log('📎 CONTENT: Carregando anexos do cliente:', clientId);
    
    try {
      const { data, error } = await supabase
        .from('content_data')
        .select('attachments')
        .eq('id', clientId)
        .single();

      if (error) {
        console.error('❌ CONTENT: Erro ao carregar anexos:', error);
        return [];
      }

      if (!data?.attachments) {
        return [];
      }

      let attachments = [];
      try {
        if (Array.isArray(data.attachments)) {
          attachments = data.attachments.map((att: any) => {
            if (typeof att === 'string') {
              const parsed = JSON.parse(att);
              return {
                name: parsed.name || 'Arquivo',
                type: parsed.type || 'application/octet-stream',
                data: parsed.data || '',
                size: parsed.size || 0
              };
            }
            return {
              name: att.name || 'Arquivo',
              type: att.type || 'application/octet-stream',
              data: att.data || '',
              size: att.size || 0
            };
          });
        } else if (typeof data.attachments === 'string') {
          const parsed = JSON.parse(data.attachments);
          if (Array.isArray(parsed)) {
            attachments = parsed;
          }
        }
      } catch (error) {
        console.warn('⚠️ CONTENT: Erro ao processar anexos:', error);
      }

      console.log('✅ CONTENT: Anexos carregados:', attachments.length);
      return attachments;
    } catch (error) {
      console.error('❌ CONTENT: Erro ao carregar anexos:', error);
      return [];
    }
  }, []);

  // Função para obter arquivos do cliente (compatibilidade)
  const getClientFiles = useCallback((clientId: string) => {
    const client = groups.flatMap(g => g.items).find(item => item.id === clientId);
    if (client?.attachments) {
      return Array.isArray(client.attachments) ? client.attachments : [];
    }
    return [];
  }, [groups]);

  const createMonth = async (monthName: string) => {
    const newGroupId = crypto.randomUUID();
    const newGroup: ContentGroup = {
      id: newGroupId,
      name: `${monthName} - CONTEÚDO`,
      color: 'bg-blue-500',
      isExpanded: true,
      items: []
    };

    setGroups([...groups, newGroup]);
    await saveContentToDatabase([...groups, newGroup]);
  };

  const updateMonth = async (groupId: string, newMonthName: string) => {
    const updatedGroups = groups.map(group =>
      group.id === groupId ? { ...group, name: `${newMonthName} - CONTEÚDO` } : group
    );

    setGroups(updatedGroups);
    await saveContentToDatabase(updatedGroups);
  };

  const deleteMonth = async (groupId: string) => {
    const updatedGroups = groups.filter(group => group.id !== groupId);
    setGroups(updatedGroups);
    await saveContentToDatabase(updatedGroups);
  };

  const duplicateMonth = async (groupId: string, newMonthName: string) => {
    const groupToDuplicate = groups.find(group => group.id === groupId);
    if (!groupToDuplicate) return;
  
    const newGroupId = crypto.randomUUID();
    const duplicatedGroup: ContentGroup = {
      id: newGroupId,
      name: `${newMonthName} - CONTEÚDO`,
      color: groupToDuplicate.color,
      isExpanded: true,
      items: groupToDuplicate.items.map(item => ({
        ...item,
        id: crypto.randomUUID(),
        elemento: item.elemento || '',
        servicos: item.servicos || '',
        observacoes: item.observacoes || '',
        hasAttachments: item.hasAttachments || false
      }))
    };
  
    const updatedGroups = [...groups, duplicatedGroup];
    setGroups(updatedGroups);
    await saveContentToDatabase(updatedGroups);
  };

  const addStatus = async (status: ContentStatus) => {
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

    setCustomColumns([...customColumns, newColumn]);
    await saveColumnsToDatabase([...customColumns, newColumn]);
  };

  const updateColumn = async (updatedColumn: ContentColumn) => {
    const updatedColumns = customColumns.map(column =>
      column.id === updatedColumn.id ? updatedColumn : column
    );

    setCustomColumns(updatedColumns);
    await saveColumnsToDatabase(updatedColumns);
  };

  const deleteColumn = async (columnId: string) => {
    const updatedColumns = customColumns.filter(column => column.id !== columnId);
    setCustomColumns(updatedColumns);
    await saveColumnsToDatabase(updatedColumns);
  };

  const moveColumnUp = async (columnId: string) => {
    const columnIndex = customColumns.findIndex(column => column.id === columnId);
    if (columnIndex <= 0) return;

    const newColumns = [...customColumns];
    const temp = newColumns[columnIndex];
    newColumns[columnIndex] = newColumns[columnIndex - 1];
    newColumns[columnIndex - 1] = temp;

    setCustomColumns(newColumns);
    await saveColumnsToDatabase(newColumns);
  };

  const moveColumnDown = async (columnId: string) => {
    const columnIndex = customColumns.findIndex(column => column.id === columnId);
    if (columnIndex >= customColumns.length - 1) return;

    const newColumns = [...customColumns];
    const temp = newColumns[columnIndex];
    newColumns[columnIndex] = newColumns[columnIndex + 1];
    newColumns[columnIndex + 1] = temp;

    setCustomColumns(newColumns);
    await saveColumnsToDatabase(newColumns);
  };

  const updateItemStatus = async (itemId: string, status: any) => {
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
    await saveContentToDatabase(updatedGroups);
  };

  const addClient = async (groupId: string, client: Omit<ContentItem, 'id'>) => {
    const newClientId = crypto.randomUUID();
    const newClient: ContentItem = {
      id: newClientId,
      elemento: client.elemento || '',
      servicos: client.servicos || '',
      observacoes: client.observacoes || '',
      hasAttachments: false,
      ...client
    };

    return safeDataOperation('content_data', async () => {
      const updatedGroups = groups.map(group =>
        group.id === groupId ? { ...group, items: [...group.items, newClient] } : group
      );

      setGroups(updatedGroups);
      await saveContentToDatabase(updatedGroups);
      return newClient;
    }, groups);
  };

  const deleteClient = async (clientId: string) => {
    return safeDataOperation('content_data', async () => {
      const updatedGroups = groups.map(group => ({
        ...group,
        items: group.items.filter(item => item.id !== clientId)
      }));

      setGroups(updatedGroups);
      await saveContentToDatabase(updatedGroups);
      return clientId;
    }, groups);
  };

  const updateClient = async (clientId: string, updates: any) => {
    return safeDataOperation('content_data', async () => {
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
      await saveContentToDatabase(updatedGroups);
      return updates;
    }, groups);
  };

  const saveContentToDatabase = async (contentData: ContentGroup[]) => {
    console.log('💾 Salvando dados no banco de dados...', contentData);
  
    try {
      // Mapear os dados para o formato correto antes de salvar
      const formattedData = contentData.flatMap(group =>
        group.items.map(item => {
          const { id, elemento, servicos, observacoes, hasAttachments, status, attachments, ...itemData } = item;
          return {
            id: id,
            group_id: group.id,
            group_name: group.name,
            group_color: group.color,
            elemento: elemento,
            servicos: servicos,
            observacoes: observacoes,
            attachments: attachments || null,
            item_data: { status, ...itemData },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        })
      );
  
      // Deletar todos os dados existentes
      const { error: deleteError } = await supabase
        .from('content_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
  
      if (deleteError) {
        console.error('❌ Erro ao limpar dados antigos:', deleteError);
        throw deleteError;
      }
  
      // Inserir os novos dados formatados
      if (formattedData.length > 0) {
        const { error: insertError } = await supabase
          .from('content_data')
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
    const defaultGroups: ContentGroup[] = [
      {
        id: crypto.randomUUID(),
        name: 'Janeiro - CONTEÚDO',
        color: 'bg-blue-500',
        isExpanded: true,
        items: []
      },
      {
        id: crypto.randomUUID(),
        name: 'Fevereiro - CONTEÚDO',
        color: 'bg-green-500',
        isExpanded: true,
        items: []
      },
      {
        id: crypto.randomUUID(),
        name: 'Março - CONTEÚDO',
        color: 'bg-red-500',
        isExpanded: true,
        items: []
      }
    ];

    setGroups(defaultGroups);
    await saveContentToDatabase(defaultGroups);
  };

  const loadColumns = useCallback(async () => {
    try {
      // Use status_config table with proper filtering
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'content')
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
        setCustomColumns(typedColumns);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar colunas:', error);
    }
  }, []);

  const loadStatuses = useCallback(async () => {
    try {
      // Use status_config table with proper filtering
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'content')
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

  const saveColumnsToDatabase = async (columns: ContentColumn[]) => {
    console.log('💾 Salvando colunas no banco de dados...', columns);

    try {
      // Delete existing columns for this module
      const { error: deleteError } = await supabase
        .from('status_config')
        .delete()
        .eq('module', 'content');

      if (deleteError) {
        console.error('❌ Erro ao limpar colunas antigas:', deleteError);
        throw deleteError;
      }

      // Insert new columns
      const formattedColumns = columns.map(column => ({
        status_id: column.id,
        status_name: column.name,
        status_color: '#3b82f6',
        module: 'content'
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

  const saveStatusesToDatabase = async (statuses: ContentStatus[]) => {
    console.log('💾 Salvando status no banco de dados...', statuses);

    try {
      // Delete existing statuses for this module
      const { error: deleteError } = await supabase
        .from('status_config')
        .delete()
        .eq('module', 'content');

      if (deleteError) {
        console.error('❌ Erro ao limpar status antigos:', deleteError);
        throw deleteError;
      }

      // Insert new statuses
      const formattedStatuses = statuses.map(status => ({
        status_id: status.id,
        status_name: status.name,
        status_color: status.color,
        module: 'content'
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
    customColumns,
    statuses,
    loading,
    updateGroups,
    loadClientAttachments,
    getClientFiles,
    createMonth,
    updateMonth,
    deleteMonth,
    duplicateMonth,
    addStatus,
    updateStatus,
    deleteStatus,
    addColumn,
    updateColumn,
    deleteColumn,
    moveColumnUp,
    moveColumnDown,
    updateItemStatus,
    addClient,
    deleteClient,
    updateClient
  };
}
