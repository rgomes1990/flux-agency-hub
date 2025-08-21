
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ContentPadariasItem {
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

export interface ContentPadariasGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: ContentPadariasItem[];
}

export interface ContentPadariasColumn {
  id: string;
  name: string;
  type: 'status' | 'text';
}

export interface ContentPadariasStatus {
  id: string;
  name: string;
  color: string;
}

export function useContentPadariasData() {
  const [groups, setGroups] = useState<ContentPadariasGroup[]>([]);
  const [columns, setColumns] = useState<ContentPadariasColumn[]>([]);
  const [customColumns, setCustomColumns] = useState<ContentPadariasColumn[]>([]);
  const [statuses, setStatuses] = useState<ContentPadariasStatus[]>([]);

  useEffect(() => {
    loadContentPadariasData();
    loadColumns();
    loadStatuses();
  }, []);

  const updateGroups = (updatedGroups: ContentPadariasGroup[]) => {
    setGroups(updatedGroups);
  };

  const createMonth = async (monthName: string) => {
    const newGroupId = crypto.randomUUID();
    const newGroup: ContentPadariasGroup = {
      id: newGroupId,
      name: `${monthName} - PADARIAS`,
      color: 'bg-blue-500',
      isExpanded: true, // Changed to true to show by default
      items: []
    };

    setGroups([...groups, newGroup]);
    await saveContentPadariasToDatabase([...groups, newGroup]);
  };

  const updateMonth = async (groupId: string, newMonthName: string) => {
    const updatedGroups = groups.map(group =>
      group.id === groupId ? { ...group, name: `${newMonthName} - PADARIAS` } : group
    );

    setGroups(updatedGroups);
    await saveContentPadariasToDatabase(updatedGroups);
  };

  const deleteMonth = async (groupId: string) => {
    const updatedGroups = groups.filter(group => group.id !== groupId);
    setGroups(updatedGroups);
    await saveContentPadariasToDatabase(updatedGroups);
  };

  const duplicateMonth = async (groupId: string, newMonthName: string) => {
    const groupToDuplicate = groups.find(group => group.id === groupId);
    if (!groupToDuplicate) return;
  
    const newGroupId = crypto.randomUUID();
    const duplicatedGroup: ContentPadariasGroup = {
      id: newGroupId,
      name: `${newMonthName} - PADARIAS`,
      color: groupToDuplicate.color,
      isExpanded: true, // Changed to true to show by default
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
    await saveContentPadariasToDatabase(updatedGroups);
  };

  const addStatus = async (status: ContentPadariasStatus) => {
    setStatuses([...statuses, status]);
    await saveStatusesToDatabase([...statuses, status]);
  };

  const updateStatus = async (updatedStatus: ContentPadariasStatus) => {
    const updatedStatuses = statuses.map(status =>
      status.id === updatedStatus.id ? updatedStatus : status
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

  const updateColumn = async (updatedColumn: ContentPadariasColumn) => {
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
    await saveContentPadariasToDatabase(updatedGroups);
  };

  const addClient = async (groupId: string, client: Omit<ContentPadariasItem, 'id'>) => {
    const newClientId = crypto.randomUUID();
    const newClient: ContentPadariasItem = {
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
    await saveContentPadariasToDatabase(updatedGroups);
  };

  const deleteClient = async (clientId: string) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== clientId)
    }));

    setGroups(updatedGroups);
    await saveContentPadariasToDatabase(updatedGroups);
  };

  const loadContentPadariasData = useCallback(async () => {
    console.log('🔄 Carregando dados do Conteúdo Padarias...');
    
    try {
      const { data, error } = await supabase
        .from('content_padarias_data')
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

      const groupsMap = new Map<string, ContentPadariasGroup>();
      const processedItems = new Set<string>();

      data.forEach(item => {
        // Skip if already processed
        if (processedItems.has(item.id)) {
          return;
        }
        processedItems.add(item.id);

        if (!groupsMap.has(item.group_name)) {
          groupsMap.set(item.group_name, {
            id: item.group_id,
            name: item.group_name,
            color: item.group_color || 'bg-blue-500',
            isExpanded: true, // Changed to true to show by default
            items: []
          });
        }

        const group = groupsMap.get(item.group_name)!;
        
        // Processar anexos de forma mais robusta
        let attachments = [];
        if (item.attachments) {
          try {
            if (typeof item.attachments === 'string') {
              attachments = JSON.parse(item.attachments);
            } else if (Array.isArray(item.attachments)) {
              attachments = item.attachments;
            }
          } catch (error) {
            console.warn('⚠️ Erro ao processar anexos:', error);
            attachments = [];
          }
        }

        // Type-safe handling of item_data
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

        const clientItem: ContentPadariasItem = {
          id: item.id,
          elemento: item.elemento,
          servicos: item.servicos || '',
          observacoes: item.observacoes || '',
          attachments: attachments,
          status: status,
          ...itemData
        };

        group.items.push(clientItem);
      });

      const loadedGroups = Array.from(groupsMap.values());
      console.log('✅ Grupos carregados:', loadedGroups.length);
      updateGroups(loadedGroups);

    } catch (error) {
      console.error('❌ Erro ao carregar dados do Conteúdo Padarias:', error);
    }
  }, []);

  const updateClient = async (clientId: string, updates: any) => {
    console.log('🔄 Padarias: Atualizando cliente:', clientId, 'com:', updates);
    
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

      updateGroups(updatedGroups);
      
      // Preparar dados para salvar no banco
      const clientToUpdate = updatedGroups.flatMap(g => g.items).find(item => item.id === clientId);
      if (clientToUpdate) {
        const { id, elemento, servicos, observacoes, attachments, status, ...itemData } = clientToUpdate;
        
        // Processar anexos corretamente - convert to JSON string for database
        let processedAttachments: string[] | null = null;
        if (attachments && Array.isArray(attachments) && attachments.length > 0) {
          processedAttachments = attachments.map(att => {
            // Convert attachment objects to JSON strings
            return JSON.stringify({
              name: att.name || 'Arquivo',
              type: att.type || 'application/octet-stream',
              data: att.data || '',
              size: att.size || 0
            });
          });
        }

        const { error } = await supabase
          .from('content_padarias_data')
          .update({
            elemento,
            servicos,
            observacoes,
            attachments: processedAttachments,
            item_data: { status, ...itemData },
            updated_at: new Date().toISOString()
          })
          .eq('id', clientId);

        if (error) {
          console.error('❌ Erro ao atualizar no banco:', error);
          throw error;
        }
      }
      
      console.log('✅ Padarias: Cliente atualizado com sucesso');
    } catch (error) {
      console.error('❌ Padarias: Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const getClientFiles = useCallback(async (clientId: string) => {
    try {
      // Find the client item
      const clientItem = groups.flatMap(group => group.items).find(item => item.id === clientId);
  
      if (!clientItem || !clientItem.attachments) {
        console.log(`No attachments found for client ${clientId}`);
        return [];
      }
  
      // Check if attachments is already an array of objects
      if (Array.isArray(clientItem.attachments)) {
        return clientItem.attachments;
      }
  
      // If attachments is a string, attempt to parse it as JSON
      if (typeof clientItem.attachments === 'string') {
        try {
          const parsedAttachments = JSON.parse(clientItem.attachments);
          if (Array.isArray(parsedAttachments)) {
            return parsedAttachments;
          } else {
            console.warn(`Unexpected format for attachments string: ${clientItem.attachments}`);
            return [];
          }
        } catch (error) {
          console.error('Error parsing attachments JSON:', error);
          return [];
        }
      }
  
      console.warn(`Unexpected format for attachments: ${clientItem.attachments}`);
      return [];
    } catch (error) {
      console.error('Error getting client files:', error);
      return [];
    }
  }, [groups]);

  const saveContentPadariasToDatabase = async (contentPadariasData: ContentPadariasGroup[]) => {
    console.log('💾 Salvando dados no banco de dados...', contentPadariasData);
  
    try {
      // Mapear os dados para o formato correto antes de salvar
      const formattedData = contentPadariasData.flatMap(group =>
        group.items.map(item => {
          const { id, elemento, servicos, observacoes, attachments, status, ...itemData } = item;
          
          // Convert attachments to proper format
          let processedAttachments: string[] | null = null;
          if (attachments && Array.isArray(attachments) && attachments.length > 0) {
            processedAttachments = attachments.map(att => {
              return JSON.stringify({
                name: att.name || 'Arquivo',
                type: att.type || 'application/octet-stream',
                data: att.data || '',
                size: att.size || 0
              });
            });
          }
          
          return {
            id: id,
            group_id: group.id,
            group_name: group.name,
            group_color: group.color,
            elemento: elemento,
            servicos: servicos,
            observacoes: observacoes,
            attachments: processedAttachments,
            item_data: { status, ...itemData },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        })
      );
  
      // Deletar todos os dados existentes
      const { error: deleteError } = await supabase
        .from('content_padarias_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
  
      if (deleteError) {
        console.error('❌ Erro ao limpar dados antigos:', deleteError);
        throw deleteError;
      }
  
      // Inserir os novos dados formatados
      if (formattedData.length > 0) {
        const { error: insertError } = await supabase
          .from('content_padarias_data')
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
    const defaultGroups: ContentPadariasGroup[] = [
      {
        id: crypto.randomUUID(),
        name: 'Janeiro - PADARIAS',
        color: 'bg-blue-500',
        isExpanded: true, // Changed to true to show by default
        items: []
      },
      {
        id: crypto.randomUUID(),
        name: 'Fevereiro - PADARIAS',
        color: 'bg-green-500',
        isExpanded: true, // Changed to true to show by default
        items: []
      },
      {
        id: crypto.randomUUID(),
        name: 'Março - PADARIAS',
        color: 'bg-red-500',
        isExpanded: true, // Changed to true to show by default
        items: []
      }
    ];

    setGroups(defaultGroups);
    await saveContentPadariasToDatabase(defaultGroups);
  };

  const loadColumns = useCallback(async () => {
    try {
      // Use status_config table with proper filtering
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'content_padarias')
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
        .eq('module', 'content_padarias')
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

  const saveColumnsToDatabase = async (columns: ContentPadariasColumn[]) => {
    console.log('💾 Salvando colunas no banco de dados...', columns);

    try {
      // Delete existing columns for this module
      const { error: deleteError } = await supabase
        .from('status_config')
        .delete()
        .eq('module', 'content_padarias');

      if (deleteError) {
        console.error('❌ Erro ao limpar colunas antigas:', deleteError);
        throw deleteError;
      }

      // Insert new columns
      const formattedColumns = columns.map(column => ({
        status_id: column.id,
        status_name: column.name,
        status_color: '#3b82f6',
        module: 'content_padarias'
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

  const saveStatusesToDatabase = async (statuses: ContentPadariasStatus[]) => {
    console.log('💾 Salvando status no banco de dados...', statuses);

    try {
      // Delete existing statuses for this module
      const { error: deleteError } = await supabase
        .from('status_config')
        .delete()
        .eq('module', 'content_padarias');

      if (deleteError) {
        console.error('❌ Erro ao limpar status antigos:', deleteError);
        throw deleteError;
      }

      // Insert new statuses
      const formattedStatuses = statuses.map(status => ({
        status_id: status.id,
        status_name: status.name,
        status_color: status.color,
        module: 'content_padarias'
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
    updateGroups,
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
    updateClient,
    getClientFiles
  };
}
