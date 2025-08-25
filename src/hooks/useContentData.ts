
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ContentItem {
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
  // Campos dinâmicos para os status das colunas
  Temas?: string;
  Textos?: string;
  Artes?: string;
  Postagem?: string;
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

  useEffect(() => {
    loadContentData();
    loadColumns();
    loadStatuses();
  }, []);

  const updateGroups = (updatedGroups: ContentGroup[]) => {
    setGroups(updatedGroups);
  };

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
        observacoes: item.observacoes || ''
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

  const updateStatus = async (updatedStatus: ContentStatus) => {
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
      ...client
    };

    const updatedGroups = groups.map(group =>
      group.id === groupId ? { ...group, items: [...group.items, newClient] } : group
    );

    setGroups(updatedGroups);
    await saveContentToDatabase(updatedGroups);
  };

  const deleteClient = async (clientId: string) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== clientId)
    }));

    setGroups(updatedGroups);
    await saveContentToDatabase(updatedGroups);
  };

  const loadContentData = useCallback(async () => {
    console.log('🔄 CONTENT: Carregando dados do Conteúdo...');
    
    try {
      const { data, error } = await supabase
        .from('content_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ CONTENT: Erro ao carregar dados:', error);
        throw error;
      }

      console.log('📊 CONTENT: Dados carregados do banco:', data?.length, 'registros');

      if (!data || data.length === 0) {
        console.log('📝 CONTENT: Nenhum dado encontrado, criando dados padrão...');
        await createDefaultData();
        return;
      }

      const groupsMap = new Map<string, ContentGroup>();
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
        
        // Processar anexos de forma mais robusta
        let attachments: Array<{ name: string; data: string; type: string; size?: number }> = [];
        if (item.attachments) {
          try {
            if (typeof item.attachments === 'string') {
              attachments = JSON.parse(item.attachments);
            } else if (Array.isArray(item.attachments)) {
              attachments = item.attachments as Array<{ name: string; data: string; type: string; size?: number }>;
            }
          } catch (error) {
            console.warn('⚠️ CONTENT: Erro ao processar anexos:', error);
            attachments = [];
          }
        }

        // Processar item_data
        let itemData: any = {};
        if (item.item_data) {
          try {
            if (typeof item.item_data === 'string') {
              itemData = JSON.parse(item.item_data);
            } else {
              itemData = item.item_data;
            }
          } catch (error) {
            console.warn('⚠️ CONTENT: Erro ao processar item_data:', error);
            itemData = {};
          }
        }

        const clientItem: ContentItem = {
          id: item.id,
          elemento: item.elemento,
          servicos: item.servicos || '',
          observacoes: item.observacoes || '',
          attachments: attachments,
          ...itemData
        };

        console.log('📎 CONTENT: Cliente carregado:', clientItem.elemento, clientItem);
        group.items.push(clientItem);
      });

      const loadedGroups = Array.from(groupsMap.values());
      console.log('✅ CONTENT: Grupos carregados:', loadedGroups.length);
      console.log('✅ CONTENT: Total de clientes:', loadedGroups.reduce((sum, group) => sum + group.items.length, 0));
      
      updateGroups(loadedGroups);

    } catch (error) {
      console.error('❌ CONTENT: Erro ao carregar dados:', error);
    }
  }, []);

  const getClientFiles = useCallback((clientId: string) => {
    try {
      const clientItem = groups.flatMap(group => group.items).find(item => item.id === clientId);
  
      if (!clientItem || !clientItem.attachments) {
        console.log(`No attachments found for client ${clientId}`);
        return [];
      }
  
      if (Array.isArray(clientItem.attachments)) {
        return clientItem.attachments.map(att => {
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

  const updateClient = async (clientId: string, updates: any) => {
    console.log('🔄 CONTENT: Atualizando cliente:', clientId, 'com:', updates);
    
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
      
      const clientToUpdate = updatedGroups.flatMap(g => g.items).find(item => item.id === clientId);
      if (clientToUpdate) {
        const { id, elemento, servicos, observacoes, attachments, ...itemData } = clientToUpdate;
        
        let processedAttachments = null;
        if (attachments && Array.isArray(attachments) && attachments.length > 0) {
          processedAttachments = attachments.map(att => {
            const processedAtt = {
              name: att.name || 'Arquivo',
              type: att.type || 'application/octet-stream',
              data: att.data || '',
              size: att.size || 0
            };
            return JSON.stringify(processedAtt);
          });
        }

        const { error } = await supabase
          .from('content_data')
          .update({
            elemento,
            servicos,
            observacoes,
            attachments: processedAttachments,
            item_data: itemData,
            updated_at: new Date().toISOString()
          })
          .eq('id', clientId);

        if (error) {
          console.error('❌ CONTENT: Erro ao atualizar no banco:', error);
          throw error;
        }

        console.log('✅ CONTENT: Cliente atualizado no banco');
      }
      
      console.log('✅ CONTENT: Cliente atualizado com sucesso');
    } catch (error) {
      console.error('❌ CONTENT: Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const saveContentToDatabase = async (contentData: ContentGroup[]) => {
    console.log('💾 CONTENT: Salvando dados no banco de dados...', contentData.length, 'grupos');
    console.log('💾 CONTENT: Total de clientes a salvar:', contentData.reduce((sum, group) => sum + group.items.length, 0));
  
    try {
      // Primeiro, limpar todos os dados existentes
      const { error: deleteError } = await supabase
        .from('content_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) {
        console.error('❌ CONTENT: Erro ao limpar dados antigos:', deleteError);
        throw deleteError;
      }

      // Preparar dados para inserção
      const allRecords: any[] = [];
      
      contentData.forEach(group => {
        group.items.forEach(item => {
          const { id, elemento, servicos, observacoes, attachments, ...itemData } = item;
          
          let processedAttachments = null;
          if (attachments && Array.isArray(attachments) && attachments.length > 0) {
            processedAttachments = attachments.map(att => {
              const processedAtt = {
                name: att.name || 'Arquivo',
                type: att.type || 'application/octet-stream',
                data: att.data || '',
                size: att.size || 0
              };
              return processedAtt;
            });
          }
          
          const record = {
            id: id,
            group_id: group.id,
            group_name: group.name,
            group_color: group.color,
            elemento: elemento,
            servicos: servicos || '',
            observacoes: observacoes || '',
            attachments: processedAttachments,
            item_data: itemData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('📝 CONTENT: Preparando registro para salvar:', elemento, record);
          allRecords.push(record);
        });
      });

      console.log('💾 CONTENT: Inserindo', allRecords.length, 'registros no banco...');

      if (allRecords.length > 0) {
        // Inserir em lotes para evitar problemas de timeout
        const batchSize = 10;
        for (let i = 0; i < allRecords.length; i += batchSize) {
          const batch = allRecords.slice(i, i + batchSize);
          console.log(`💾 CONTENT: Inserindo lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(allRecords.length/batchSize)}:`, batch.length, 'registros');
          
          const { error: insertError } = await supabase
            .from('content_data')
            .insert(batch);

          if (insertError) {
            console.error('❌ CONTENT: Erro ao inserir lote:', insertError);
            throw insertError;
          }
          
          console.log('✅ CONTENT: Lote inserido com sucesso!');
        }
      }

      console.log('✅ CONTENT: Todos os dados salvos com sucesso!');
    } catch (error) {
      console.error('❌ CONTENT: Erro ao salvar dados no banco de dados:', error);
      throw error;
    }
  };

  const createDefaultData = async () => {
    console.log('🔧 CONTENT: Criando dados padrão...');

    // Primeiro, criar os status padrão
    const defaultStatuses: ContentStatus[] = [
      { id: 'aprovado', name: 'Aprovado', color: '#22c55e' },
      { id: 'parado', name: 'Parado', color: '#ef4444' },
      { id: 'andamento', name: 'Andamento', color: '#f97316' },
      { id: 'aprovacao-parcial', name: 'Aprovação parcial', color: '#3b82f6' },
      { id: 'selecionar', name: 'Selecionar', color: '#9ca3af' },
      { id: 'enviar-aprovacao', name: 'Enviar aprovação', color: '#6b7280' }
    ];

    console.log('✅ CONTENT: Criando status padrão...');
    setStatuses(defaultStatuses);
    await saveStatusesToDatabase(defaultStatuses);

    // Criar colunas padrão
    const defaultColumns: ContentColumn[] = [
      { id: 'temas', name: 'Temas', type: 'status' },
      { id: 'textos', name: 'Textos', type: 'status' },
      { id: 'artes', name: 'Artes', type: 'status' },
      { id: 'postagem', name: 'Postagem', type: 'status' }
    ];

    console.log('✅ CONTENT: Criando colunas padrão...');
    setColumns(defaultColumns);
    setCustomColumns(defaultColumns);
    await saveColumnsToDatabase(defaultColumns);

    // Criar todos os clientes padrão com IDs únicos
    const defaultGroupId = crypto.randomUUID();
    const defaultClients: ContentItem[] = [
      {
        id: crypto.randomUUID(),
        elemento: 'Protenista',
        servicos: '16 Conteúdos',
        observacoes: '',
        Temas: 'aprovado',
        Textos: 'parado',
        Artes: 'parado',
        Postagem: 'parado'
      },
      {
        id: crypto.randomUUID(),
        elemento: 'Aereo Leste',
        servicos: '4 Conteúdos',
        observacoes: '',
        Temas: 'aprovado',
        Textos: 'aprovado',
        Artes: 'aprovado',
        Postagem: 'aprovacao-parcial'
      },
      {
        id: crypto.randomUUID(),
        elemento: 'Grupo Forte',
        servicos: '4 Conteúdos',
        observacoes: '',
        Temas: 'aprovado',
        Textos: 'aprovado',
        Artes: 'aprovado',
        Postagem: 'aprovado'
      },
      {
        id: crypto.randomUUID(),
        elemento: 'Ana Cardoso',
        servicos: '8 Conteúdos',
        observacoes: '',
        Temas: 'andamento',
        Textos: 'parado',
        Artes: 'parado',
        Postagem: 'parado'
      },
      {
        id: crypto.randomUUID(),
        elemento: 'Medicate',
        servicos: '8 Conteúdos',
        observacoes: '',
        Temas: 'selecionar',
        Textos: 'selecionar',
        Artes: 'selecionar',
        Postagem: 'selecionar'
      },
      {
        id: crypto.randomUUID(),
        elemento: 'Aéreo Leste',
        servicos: '4 Conteúdos',
        observacoes: '',
        Temas: 'selecionar',
        Textos: 'selecionar',
        Artes: 'selecionar',
        Postagem: 'selecionar'
      },
      {
        id: crypto.randomUUID(),
        elemento: 'Gran Vitale',
        servicos: '4 Conteúdos',
        observacoes: '',
        Temas: 'aprovado',
        Textos: 'enviar-aprovacao',
        Artes: 'parado',
        Postagem: 'parado'
      },
      {
        id: crypto.randomUUID(),
        elemento: 'Farmácia Santo Sal',
        servicos: '',
        observacoes: '',
        Temas: 'selecionar',
        Textos: 'selecionar',
        Artes: 'selecionar',
        Postagem: 'selecionar'
      },
      {
        id: crypto.randomUUID(),
        elemento: 'OrangeXpress',
        servicos: '4 Conteúdos',
        observacoes: '',
        Temas: 'selecionar',
        Textos: 'selecionar',
        Artes: 'selecionar',
        Postagem: 'selecionar'
      },
      {
        id: crypto.randomUUID(),
        elemento: 'MEDICATE',
        servicos: '8 postagens',
        observacoes: '',
        Temas: 'selecionar',
        Textos: 'selecionar',
        Artes: 'selecionar',
        Postagem: 'selecionar'
      }
    ];

    console.log('✅ CONTENT: Criando grupo com', defaultClients.length, 'clientes...');
    
    const defaultGroups: ContentGroup[] = [
      {
        id: defaultGroupId,
        name: 'AGOSTO - CONTEÚDO',
        color: 'bg-blue-500',
        isExpanded: true,
        items: defaultClients
      }
    ];

    console.log('✅ CONTENT: Salvando grupos padrão...');
    setGroups(defaultGroups);
    await saveContentToDatabase(defaultGroups);
    
    console.log('✅ CONTENT: Dados padrão criados com sucesso!');
  };

  const loadColumns = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('column_config')
        .select('*')
        .eq('module', 'content')
        .order('column_order', { ascending: true });

      if (error) {
        console.error('❌ CONTENT: Erro ao carregar colunas:', error);
        return;
      }

      if (data && data.length > 0) {
        const typedColumns = data.map(col => ({
          id: col.column_id,
          name: col.column_name,
          type: col.column_type as 'status' | 'text'
        }));
        setColumns(typedColumns);
        setCustomColumns(typedColumns);
        console.log('✅ CONTENT: Colunas carregadas:', typedColumns.length);
      }
    } catch (error) {
      console.error('❌ CONTENT: Erro ao carregar colunas:', error);
    }
  }, []);

  const loadStatuses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'content')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ CONTENT: Erro ao carregar status:', error);
        return;
      }

      if (data && data.length > 0) {
        const typedStatuses = data.map(status => ({
          id: status.status_id,
          name: status.status_name,
          color: status.status_color
        }));
        setStatuses(typedStatuses);
        console.log('✅ CONTENT: Status carregados:', typedStatuses.length);
      }
    } catch (error) {
      console.error('❌ CONTENT: Erro ao carregar status:', error);
    }
  }, []);

  const saveColumnsToDatabase = async (columns: ContentColumn[]) => {
    console.log('💾 CONTENT: Salvando colunas no banco de dados...', columns);

    try {
      // Deletar colunas antigas
      const { error: deleteError } = await supabase
        .from('column_config')
        .delete()
        .eq('module', 'content');

      if (deleteError) {
        console.error('❌ CONTENT: Erro ao limpar colunas antigas:', deleteError);
        throw deleteError;
      }

      // Inserir novas colunas
      const formattedColumns = columns.map((column, index) => ({
        column_id: column.id,
        column_name: column.name,
        column_type: column.type,
        column_order: index,
        module: 'content'
      }));

      if (formattedColumns.length > 0) {
        const { error: insertError } = await supabase
          .from('column_config')
          .insert(formattedColumns);

        if (insertError) {
          console.error('❌ CONTENT: Erro ao inserir colunas:', insertError);
          throw insertError;
        }
      }

      console.log('✅ CONTENT: Colunas salvas com sucesso!');
    } catch (error) {
      console.error('❌ CONTENT: Erro ao salvar colunas no banco de dados:', error);
    }
  };

  const saveStatusesToDatabase = async (statuses: ContentStatus[]) => {
    console.log('💾 CONTENT: Salvando status no banco de dados...', statuses);

    try {
      const { error: deleteError } = await supabase
        .from('status_config')
        .delete()
        .eq('module', 'content');

      if (deleteError) {
        console.error('❌ CONTENT: Erro ao limpar status antigos:', deleteError);
        throw deleteError;
      }

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
          console.error('❌ CONTENT: Erro ao inserir status:', insertError);
          throw insertError;
        }
      }

      console.log('✅ CONTENT: Status salvos com sucesso!');
    } catch (error) {
      console.error('❌ CONTENT: Erro ao salvar status no banco de dados:', error);
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
