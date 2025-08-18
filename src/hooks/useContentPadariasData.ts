import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ServiceStatus {
  id: string;
  name: string;
  color: string;
}

interface ContentItem {
  id: string;
  elemento: string;
  servicos?: string;
  observacoes?: string;
  attachments?: string[];
  [key: string]: any;
}

interface ContentGroup {
  id: string;
  name: string;
  isExpanded: boolean;
  color: string;
  items: ContentItem[];
}

interface ContentColumn {
  id: string;
  name: string;
  type: 'status' | 'text';
}

export function useContentPadariasData() {
  const [groups, setGroups] = useState<ContentGroup[]>([]);
  const [columns, setColumns] = useState<string[]>(['elemento', 'observacoes']);
  const [customColumns, setCustomColumns] = useState<ContentColumn[]>([]);
  const [statuses, setStatuses] = useState<ServiceStatus[]>([
    { id: '1', name: 'Pendente', color: '#ef4444' },
    { id: '2', name: 'Em Progresso', color: '#f59e0b' },
    { id: '3', name: 'Concluído', color: '#10b981' },
    { id: '4', name: 'Cancelado', color: '#6b7280' }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadContentPadariasData();
      loadColumns();
      loadStatuses();
    }
  }, [user]);

  const loadColumns = async () => {
    try {
      const { data, error } = await supabase
        .from('column_config')
        .select('*')
        .eq('module', 'content_padarias_data');

      if (error) throw error;

      if (data) {
        const mappedColumns = data.map(col => ({
          id: col.column_id,
          name: col.column_name,
          type: col.column_type as 'status' | 'text'
        }));
        setCustomColumns(mappedColumns);
      }
    } catch (error) {
      console.error('Error loading columns:', error);
    }
  };

  const loadStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'content_padarias_data');

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedStatuses = data.map(status => ({
          id: status.status_id,
          name: status.status_name,
          color: status.status_color
        }));
        setStatuses(mappedStatuses);
      }
    } catch (error) {
      console.error('Error loading statuses:', error);
    }
  };

  const loadContentPadariasData = async () => {
    setIsLoading(true);
    console.log('📂 loadContentPadariasData: Iniciando carregamento dos dados...');
    
    try {
      const { data, error } = await supabase
        .from('content_padarias_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar dados:', error);
        throw error;
      }

      console.log('📂 Dados carregados do banco:', data?.length || 0, 'registros');
      console.log('📂 Dados completos:', JSON.stringify(data, null, 2));

      if (data) {
        const groupedData: { [key: string]: ContentGroup } = {};
        
        data.forEach(item => {
          const groupId = item.group_id;
          const groupName = item.group_name;
          
          console.log('📂 Processando item:', groupId, groupName, item.elemento);
          
          if (!groupedData[groupId]) {
            groupedData[groupId] = {
              id: groupId,
              name: groupName,
              isExpanded: false,
              color: item.group_color || '#3b82f6',
              items: []
            };
            console.log('📂 Grupo criado:', groupId, groupName);
          }

          // Só adicionar item se não for um placeholder (elemento vazio) e se tem item_data
          if (item.elemento && item.elemento.trim() !== '' && item.item_data) {
            let itemData;
            try {
              if (typeof item.item_data === 'string') {
                itemData = JSON.parse(item.item_data);
              } else {
                itemData = item.item_data;
              }
            } catch (parseError) {
              console.error('❌ Erro ao fazer parse do item_data:', parseError);
              return;
            }

            const existingItem = groupedData[groupId].items.find(i => i.id === itemData.id);
            if (!existingItem) {
              groupedData[groupId].items.push(itemData as ContentItem);
              console.log('📂 Item adicionado ao grupo:', item.elemento);
            }
          } else {
            console.log('📂 Placeholder ignorado para grupo:', groupName);
          }
        });

        const finalGroups = Object.values(groupedData);
        console.log('📂 Grupos finais carregados:', finalGroups.length);
        console.log('📂 Estrutura final:', JSON.stringify(finalGroups, null, 2));
        
        setGroups(finalGroups);
      }
    } catch (error) {
      console.error('❌ Error loading content data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContentPadariasToDatabase = async (newGroups: ContentGroup[]) => {
    console.log('💾 saveContentPadariasToDatabase: Iniciando salvamento de', newGroups.length, 'grupos');
    
    try {
      console.log('💾 Deletando dados antigos...');
      const { error: deleteError } = await supabase
        .from('content_padarias_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) {
        console.error('❌ Erro ao deletar dados antigos:', deleteError);
        throw deleteError;
      }
      console.log('✅ Dados antigos deletados com sucesso');

      // Para cada grupo, se não tiver itens, ainda precisa ser salvo
      const dataToInsert = newGroups.flatMap(group => {
        console.log('💾 Processando grupo:', group.name, 'com', group.items.length, 'itens');
        
        if (group.items.length === 0) {
          // Se não há itens, criar um registro placeholder para o grupo
          const placeholder = {
            group_id: group.id,
            group_name: group.name,
            group_color: group.color,
            elemento: '', // Placeholder vazio
            servicos: null as string | null,
            observacoes: null as string | null,
            attachments: null as string[] | null,
            item_data: null as any
          };
          console.log('💾 Criando placeholder para grupo vazio:', placeholder);
          return [placeholder];
        }
        
        return group.items.map(item => ({
          group_id: group.id,
          group_name: group.name,
          group_color: group.color,
          elemento: item.elemento,
          servicos: item.servicos || null,
          observacoes: item.observacoes || null,
          attachments: item.attachments || null,
          item_data: {
            id: item.id,
            elemento: item.elemento,
            servicos: item.servicos,
            observacoes: item.observacoes,
            attachments: item.attachments,
            ...Object.fromEntries(
              customColumns.map(col => [col.name, item[col.name] || ''])
            )
          }
        }));
      });

      console.log('💾 Dados para inserir:', dataToInsert.length, 'registros');
      console.log('💾 Dados completos:', JSON.stringify(dataToInsert, null, 2));

      if (dataToInsert.length > 0) {
        console.log('💾 Inserindo dados no banco...');
        const { data: insertedData, error: insertError } = await supabase
          .from('content_padarias_data')
          .insert(dataToInsert)
          .select();

        if (insertError) {
          console.error('❌ Erro ao inserir dados:', insertError);
          throw insertError;
        }
        
        console.log('✅ Dados inseridos com sucesso:', insertedData?.length || 0, 'registros');
      } else {
        console.log('⚠️ Nenhum dado para inserir');
      }

      console.log('✅ Content padarias data saved successfully');
    } catch (error) {
      console.error('❌ Error saving content data:', error);
      throw error;
    }
  };

  const createMonth = async (monthName: string) => {
    console.log('🔵 createMonth: Iniciando criação do mês:', monthName);
    
    const newGroup: ContentGroup = {
      id: crypto.randomUUID(),
      name: monthName,
      isExpanded: true,
      color: '#3b82f6',
      items: []
    };

    console.log('🔵 createMonth: Novo grupo criado:', newGroup);

    const newGroups = [...groups, newGroup];
    console.log('🔵 createMonth: Lista de grupos atualizada:', newGroups.length, 'grupos');
    
    setGroups(newGroups);
    
    try {
      await saveContentPadariasToDatabase(newGroups);
      console.log('✅ createMonth: Mês salvo com sucesso!');
    } catch (error) {
      console.error('❌ createMonth: Erro ao salvar mês:', error);
      throw error;
    }
  };

  const addClient = async (groupId: string, clientData: Partial<ContentItem>) => {
    const existingClient = groups
      .flatMap(group => group.items)
      .find(item => item.elemento?.toLowerCase() === clientData.elemento?.toLowerCase());

    if (existingClient) {
      throw new Error('Um cliente com este elemento já existe.');
    }

    const newItem: ContentItem = {
      id: crypto.randomUUID(),
      elemento: clientData.elemento || '',
      servicos: clientData.servicos || '',
      observacoes: clientData.observacoes,
      attachments: clientData.attachments || []
    };

    customColumns.forEach(column => {
      if (!newItem.hasOwnProperty(column.name)) {
        newItem[column.name] = column.type === 'status' ? '' : '';
      }
    });

    const newGroups = groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          items: [...group.items, newItem]
        };
      }
      return group;
    });

    setGroups(newGroups);
    await saveContentPadariasToDatabase(newGroups);
  };

  const addColumn = async (name: string, type: 'status' | 'text') => {
    const newColumn: ContentColumn = {
      id: crypto.randomUUID(),
      name,
      type
    };

    const { error } = await supabase
      .from('column_config')
      .insert({
        column_id: newColumn.id,
        column_name: newColumn.name,
        column_type: newColumn.type,
        module: 'content_padarias_data'
      });

    if (error) throw error;

    setCustomColumns([...customColumns, newColumn]);

    const newGroups = groups.map(group => ({
      ...group,
      items: group.items.map(item => ({
        ...item,
        [name]: type === 'status' ? '' : ''
      }))
    }));

    setGroups(newGroups);
    await saveContentPadariasToDatabase(newGroups);
  };

  const addStatus = async (status: ServiceStatus) => {
    const newStatus = { ...status, id: crypto.randomUUID() };
    
    const { error } = await supabase
      .from('status_config')
      .insert({
        status_id: newStatus.id,
        status_name: newStatus.name,
        status_color: newStatus.color,
        module: 'content_padarias_data'
      });

    if (error) throw error;

    setStatuses([...statuses, newStatus]);
  };

  const updateStatus = async (statusId: string, updates: Partial<ServiceStatus>) => {
    const { error } = await supabase
      .from('status_config')
      .update(updates)
      .eq('status_id', statusId);

    if (error) throw error;

    setStatuses(statuses.map(status => 
      status.id === statusId ? { ...status, ...updates } : status
    ));
  };

  const deleteStatus = async (statusId: string) => {
    const { error } = await supabase
      .from('status_config')
      .delete()
      .eq('status_id', statusId);

    if (error) throw error;

    setStatuses(statuses.filter(status => status.id !== statusId));
  };

  const updateColumn = async (id: string, updates: Partial<ContentColumn>) => {
    const { error } = await supabase
      .from('column_config')
      .update(updates)
      .eq('column_id', id);

    if (error) throw error;

    setCustomColumns(customColumns.map(column => 
      column.id === id ? { ...column, ...updates } : column
    ));
  };

  const deleteColumn = async (id: string) => {
    const columnToDelete = customColumns.find(col => col.id === id);
    if (!columnToDelete) return;

    const { error } = await supabase
      .from('column_config')
      .delete()
      .eq('column_id', id);

    if (error) throw error;

    setCustomColumns(customColumns.filter(column => column.id !== id));

    const newGroups = groups.map(group => ({
      ...group,
      items: group.items.map(item => {
        const { [columnToDelete.name]: removedField, ...rest } = item;
        return rest as ContentItem;
      })
    }));

    setGroups(newGroups);
    await saveContentPadariasToDatabase(newGroups);
  };

  const moveColumnUp = async (columnId: string) => {
    const currentIndex = customColumns.findIndex(col => col.id === columnId);
    if (currentIndex <= 0) return;

    const newColumns = [...customColumns];
    [newColumns[currentIndex], newColumns[currentIndex - 1]] = [newColumns[currentIndex - 1], newColumns[currentIndex]];
    
    // Update column orders in database
    const updatePromises = newColumns.map((col, index) => 
      supabase
        .from('column_config')
        .update({ column_order: index })
        .eq('column_id', col.id)
        .eq('module', 'content_padarias_data')
    );

    await Promise.all(updatePromises);
    setCustomColumns(newColumns);
  };

  const moveColumnDown = async (columnId: string) => {
    const currentIndex = customColumns.findIndex(col => col.id === columnId);
    if (currentIndex >= customColumns.length - 1) return;

    const newColumns = [...customColumns];
    [newColumns[currentIndex], newColumns[currentIndex + 1]] = [newColumns[currentIndex + 1], newColumns[currentIndex]];
    
    // Update column orders in database
    const updatePromises = newColumns.map((col, index) => 
      supabase
        .from('column_config')
        .update({ column_order: index })
        .eq('column_id', col.id)
        .eq('module', 'content_padarias_data')
    );

    await Promise.all(updatePromises);
    setCustomColumns(newColumns);
  };

  const updateItemStatus = async (itemId: string, field: string, statusId: string) => {
    const newGroups = groups.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId ? { ...item, [field]: statusId } : item
      )
    }));

    setGroups(newGroups);
    await saveContentPadariasToDatabase(newGroups);
  };

  const deleteClient = async (itemId: string) => {
    const newGroups = groups.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== itemId)
    }));

    setGroups(newGroups);
    await saveContentPadariasToDatabase(newGroups);
  };

  const updateClient = async (itemId: string, updates: Partial<ContentItem>) => {
    try {
      if (updates.attachments) {
        const { error: storageError } = await supabase.storage
          .from('client-files')
          .upload(`${itemId}/${Date.now()}_${updates.attachments[0]}`, updates.attachments[0]);

        if (storageError) throw storageError;
      }

      const newGroups = groups.map(group => ({
        ...group,
        items: group.items.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        )
      }));

      setGroups(newGroups);
      await saveContentPadariasToDatabase(newGroups);
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  const getClientFiles = async (clientId: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('client-files')
        .list(clientId);

      if (error) throw error;

      const files = await Promise.all(
        (data || []).map(async (file) => {
          const { data: urlData } = await supabase.storage
            .from('client-files')
            .createSignedUrl(`${clientId}/${file.name}`, 3600);

          return {
            name: file.name,
            url: urlData?.signedUrl || ''
          };
        })
      );

      return files;
    } catch (error) {
      console.error('Error getting client files:', error);
      return [];
    }
  };

  const updateGroups = (newGroups: ContentGroup[]) => {
    setGroups(newGroups);
    // Save to database
    saveContentPadariasToDatabase(newGroups);
  };

  const updateMonth = async (groupId: string, newName: string) => {
    const newGroups = groups.map(group => 
      group.id === groupId ? { ...group, name: newName } : group
    );
    setGroups(newGroups);
    await saveContentPadariasToDatabase(newGroups);
  };

  const deleteMonth = async (groupId: string) => {
    const newGroups = groups.filter(group => group.id !== groupId);
    setGroups(newGroups);
    await saveContentPadariasToDatabase(newGroups);
  };

  const duplicateMonth = async (sourceGroupId: string, newMonthName: string) => {
    const sourceGroup = groups.find(g => g.id === sourceGroupId);
    if (!sourceGroup) return;

    const newGroup: ContentGroup = {
      id: crypto.randomUUID(),
      name: newMonthName,
      isExpanded: true,
      color: sourceGroup.color,
      items: sourceGroup.items.map(item => ({
        ...item,
        id: crypto.randomUUID(),
        elemento: item.elemento
      }))
    };

    customColumns.forEach(column => {
      if (column.type === 'status') {
        newGroup.items = newGroup.items.map(item => ({
          ...item,
          [column.name]: ''
        }));
      }
    });

    const newGroups = [...groups, newGroup];
    setGroups(newGroups);
    await saveContentPadariasToDatabase(newGroups);
  };

  return {
    groups,
    columns,
    customColumns,
    statuses,
    createMonth,
    duplicateMonth,
    addClient,
    addColumn,
    addStatus,
    updateStatus,
    deleteStatus,
    updateColumn,
    moveColumnUp,
    moveColumnDown,
    deleteColumn,
    updateItemStatus,
    deleteClient,
    updateClient,
    getClientFiles,
    updateGroups,
    updateMonth,
    deleteMonth,
    isLoading
  };
}