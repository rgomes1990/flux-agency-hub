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
      isExpanded: true,
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
    await saveContentPadariasToDatabase(updatedGroups);
  };

  const addStatus = async (status: ContentPadariasStatus) => {
    console.log('➕ Adicionando status:', status);
    setStatuses([...statuses, status]);
    await saveStatusesToDatabase([...statuses, status]);
  };

  const updateStatus = async (updatedStatus: ContentPadariasStatus) => {
    console.log('✏️ Atualizando status:', updatedStatus);
    const updatedStatuses = statuses.map(status =>
      status.id === updatedStatus.id ? updatedStatus : status
    );

    setStatuses(updatedStatuses);
    await saveStatusesToDatabase(updatedStatuses);
  };

  const deleteStatus = async (statusId: string) => {
    console.log('🗑️ Deletando status:', statusId);
    const updatedStatuses = statuses.filter(status => status.id !== statusId);
    setStatuses(updatedStatuses);
    await saveStatusesToDatabase(updatedStatuses);
  };

  const addColumn = async (columnName: string, columnType: 'status' | 'text') => {
    console.log('➕ Adicionando coluna:', { columnName, columnType });
    const newColumn = {
      id: crypto.randomUUID(),
      name: columnName,
      type: columnType
    };

    setCustomColumns([...customColumns, newColumn]);
    await saveColumnsToDatabase([...customColumns, newColumn]);
  };

  const updateColumn = async (updatedColumn: ContentPadariasColumn) => {
    console.log('✏️ Atualizando coluna:', updatedColumn);
    const updatedColumns = customColumns.map(column =>
      column.id === updatedColumn.id ? updatedColumn : column
    );

    setCustomColumns(updatedColumns);
    await saveColumnsToDatabase(updatedColumns);
  };

  const deleteColumn = async (columnId: string) => {
    console.log('🗑️ Deletando coluna:', columnId);
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

  const updateItemStatus = async (itemId: string, field: string, statusId: string) => {
    console.log('🎨 Atualizando status do item:', { itemId, field, statusId });
    
    // Encontrar o status pelo ID
    const selectedStatus = statuses.find(s => s.id === statusId);
    if (!selectedStatus) {
      console.warn('⚠️ Status não encontrado:', statusId);
      return;
    }

    const updatedGroups = groups.map(group => ({
      ...group,
      items: group.items.map(item => {
        if (item.id === itemId) {
          console.log('📝 Atualizando campo:', field, 'com status:', selectedStatus);
          return { 
            ...item, 
            [field]: selectedStatus  // Armazena o objeto status completo no campo específico
          };
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
            isExpanded: true,
            items: []
          });
        }

        const group = groupsMap.get(item.group_name)!;
        
        // Processar anexos de forma mais robusta - FIXED
        let attachments: Array<{ name: string; data: string; type: string; size?: number }> = [];
        if (item.attachments) {
          try {
            if (Array.isArray(item.attachments)) {
              // Se é um array, processar cada item
              const mappedAttachments = item.attachments.map((att: any) => {
                if (typeof att === 'string') {
                  // Se é string JSON, fazer parse
                  try {
                    const parsed = JSON.parse(att);
                    return {
                      name: parsed.name || 'Arquivo',
                      type: parsed.type || 'application/octet-stream',
                      data: parsed.data || '',
                      size: parsed.size || 0
                    };
                  } catch {
                    console.warn('⚠️ Erro ao fazer parse do anexo string:', att);
                    return null;
                  }
                } else if (typeof att === 'object' && att !== null) {
                  // Se já é objeto, garantir propriedades
                  return {
                    name: att.name || 'Arquivo',
                    type: att.type || 'application/octet-stream',
                    data: att.data || '',
                    size: att.size || 0
                  };
                }
                return null;
              });
              
              // Filter out null values with proper typing
              attachments = mappedAttachments.filter((att: any): att is { name: string; data: string; type: string; size?: number } => att !== null);
            } else if (typeof item.attachments === 'string') {
              // Se é string JSON completa
              const parsed = JSON.parse(item.attachments);
              if (Array.isArray(parsed)) {
                attachments = parsed.map((att: any) => ({
                  name: att.name || 'Arquivo',
                  type: att.type || 'application/octet-stream',
                  data: att.data || '',
                  size: att.size || 0
                }));
              }
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

        console.log('📎 Cliente carregado com anexos:', clientItem.elemento, attachments.length);
        group.items.push(clientItem);
      });

      const loadedGroups = Array.from(groupsMap.values());
      console.log('✅ Grupos carregados:', loadedGroups.length);
      updateGroups(loadedGroups);

    } catch (error) {
      console.error('❌ Erro ao carregar dados do Conteúdo Padarias:', error);
    }
  }, []);

  const getClientFiles = useCallback((clientId: string) => {
    try {
      // Find the client item
      const clientItem = groups.flatMap(group => group.items).find(item => item.id === clientId);
  
      if (!clientItem || !clientItem.attachments) {
        console.log(`No attachments found for client ${clientId}`);
        return [];
      }
  
      // Check if attachments is already an array of objects
      if (Array.isArray(clientItem.attachments)) {
        return clientItem.attachments.map(att => {
          // Se o anexo é uma string JSON, parsear
          if (typeof att === 'string') {
            try {
              const parsed = JSON.parse(att);
              return {
                name: parsed.name || 'Arquivo',
                type: parsed.type || 'application/octet-stream',
                data: parsed.data || '',
                size: parsed.size || 0
              };
            } catch (error) {
              console.error('Error parsing attachment JSON:', error);
              return { name: 'Arquivo corrompido', type: 'unknown', data: '', size: 0 };
            }
          }
          // Se já é um objeto, garantir que tem as propriedades necessárias
          return {
            name: att.name || 'Arquivo',
            type: att.type || 'application/octet-stream',
            data: att.data || '',
            size: att.size || 0
          };
        });
      }
  
      console.warn(`Unexpected format for attachments: ${clientItem.attachments}`);
      return [];
    } catch (error) {
      console.error('Error getting client files:', error);
      return [];
    }
  }, [groups]);

  const addClientAttachment = async (clientId: string, attachment: { name: string; data: string; type: string; size?: number }) => {
    console.log('🔄 Padarias: Adicionando anexo ao cliente:', clientId);
    
    try {
      const clientFiles = getClientFiles(clientId);
      const newAttachment = {
        name: attachment.name,
        type: attachment.type,
        data: attachment.data,
        size: attachment.size || 0
      };
      
      const updatedAttachments = [...clientFiles, newAttachment];
      
      await updateClient(clientId, { attachments: updatedAttachments });
      
      console.log('✅ Padarias: Anexo adicionado com sucesso');
    } catch (error) {
      console.error('❌ Padarias: Erro ao adicionar anexo:', error);
      throw error;
    }
  };

  const removeClientAttachment = async (clientId: string, attachmentIndex: number) => {
    console.log('🔄 Padarias: Removendo anexo do cliente:', clientId, 'índice:', attachmentIndex);
    
    try {
      const clientFiles = getClientFiles(clientId);
      console.log('📎 Padarias: Anexos atuais:', clientFiles);
      
      if (attachmentIndex < 0 || attachmentIndex >= clientFiles.length) {
        console.warn('⚠️ Padarias: Índice de anexo inválido:', attachmentIndex);
        return;
      }
      
      const updatedAttachments = clientFiles.filter((_, index) => index !== attachmentIndex);
      console.log('📎 Padarias: Anexos após remoção:', updatedAttachments);
      
      await updateClient(clientId, { attachments: updatedAttachments });
      
      console.log('✅ Padarias: Anexo removido com sucesso');
    } catch (error) {
      console.error('❌ Padarias: Erro ao remover anexo:', error);
      throw error;
    }
  };

  const updateClient = async (clientId: string, updates: any) => {
    console.log('🔄 Padarias: Atualizando cliente:', clientId, 'com:', updates);
    
    try {
      // Atualizar estado local primeiro
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
      
      // Preparar dados para salvar no banco - FIXED: Better attachment handling
      const clientToUpdate = updatedGroups.flatMap(g => g.items).find(item => item.id === clientId);
      if (clientToUpdate) {
        const { id, elemento, servicos, observacoes, attachments, status, ...itemData } = clientToUpdate;
        
        // Process attachments correctly - IMPROVED
        let processedAttachments: string[] | null = null;
        
        if (attachments !== undefined) {
          if (Array.isArray(attachments) && attachments.length > 0) {
            // Garantir que cada anexo tem todas as propriedades necessárias
            processedAttachments = attachments.map(att => {
              const processedAtt = {
                name: att.name || 'Arquivo',
                type: att.type || 'application/octet-stream',
                data: att.data || '',
                size: att.size || 0
              };
              
              console.log('📎 Processando anexo para salvar:', processedAtt.name, processedAtt.type, processedAtt.size);
              return JSON.stringify(processedAtt);
            });
          } else {
            // If attachments array is empty or null, explicitly set to null
            processedAttachments = null;
          }
        }

        console.log('💾 Salvando anexos processados:', processedAttachments?.length || 0, 'anexos');

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

        console.log('✅ Cliente atualizado no banco com', processedAttachments?.length || 0, 'anexos');
      }
      
      console.log('✅ Padarias: Cliente atualizado com sucesso');
    } catch (error) {
      console.error('❌ Padarias: Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const saveContentPadariasToDatabase = async (contentPadariasData: ContentPadariasGroup[]) => {
    console.log('💾 Salvando dados no banco de dados...', contentPadariasData);
  
    try {
      // Mapear os dados para o formato correto antes de salvar - IMPROVED
      const formattedData = contentPadariasData.flatMap(group =>
        group.items.map(item => {
          const { id, elemento, servicos, observacoes, attachments, status, ...itemData } = item;
          
          // Convert attachments to proper format - ENHANCED
          let processedAttachments: string[] | null = null;
          if (attachments && Array.isArray(attachments) && attachments.length > 0) {
            processedAttachments = attachments.map(att => {
              // Garantir que o anexo tem todas as propriedades necessárias
              const processedAtt = {
                name: att.name || 'Arquivo',
                type: att.type || 'application/octet-stream',
                data: att.data || '',
                size: att.size || 0
              };
              
              console.log('📎 Salvando anexo:', processedAtt.name, processedAtt.type, processedAtt.size, 'bytes');
              return JSON.stringify(processedAtt);
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
        isExpanded: true,
        items: []
      },
      {
        id: crypto.randomUUID(),
        name: 'Fevereiro - PADARIAS',
        color: 'bg-green-500',
        isExpanded: true,
        items: []
      },
      {
        id: crypto.randomUUID(),
        name: 'Março - PADARIAS',
        color: 'bg-red-500',
        isExpanded: true,
        items: []
      }
    ];

    setGroups(defaultGroups);
    await saveContentPadariasToDatabase(defaultGroups);
  };

  const loadColumns = useCallback(async () => {
    console.log('🔄 Carregando colunas...');
    try {
      const { data, error } = await supabase
        .from('column_config')
        .select('*')
        .eq('module', 'content_padarias')
        .order('column_order', { ascending: true });

      if (error) {
        console.error('❌ Erro ao carregar colunas:', error);
        return;
      }

      if (data) {
        const typedColumns = data.map(col => ({
          id: col.column_id,
          name: col.column_name,
          type: col.column_type as 'status' | 'text'
        }));
        console.log('✅ Colunas carregadas:', typedColumns);
        setCustomColumns(typedColumns);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar colunas:', error);
    }
  }, []);

  const loadStatuses = useCallback(async () => {
    console.log('🔄 Carregando status...');
    try {
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
        console.log('✅ Status carregados:', typedStatuses);
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
        .from('column_config')
        .delete()
        .eq('module', 'content_padarias');

      if (deleteError) {
        console.error('❌ Erro ao limpar colunas antigas:', deleteError);
        throw deleteError;
      }

      // Insert new columns
      const formattedColumns = columns.map((column, index) => ({
        column_id: column.id,
        column_name: column.name,
        column_type: column.type,
        column_order: index,
        module: 'content_padarias'
      }));

      if (formattedColumns.length > 0) {
        const { error: insertError } = await supabase
          .from('column_config')
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
    getClientFiles,
    addClientAttachment,
    removeClientAttachment
  };
}
