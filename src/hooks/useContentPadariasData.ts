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
    try {
      const { data, error } = await supabase
        .from('content_padarias_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const groupedData: { [key: string]: ContentGroup } = {};
        
        data.forEach(item => {
          const groupId = item.group_id;
          const groupName = item.group_name;
          
          if (!groupedData[groupId]) {
            groupedData[groupId] = {
              id: groupId,
              name: groupName,
              isExpanded: false,
              color: item.group_color || '#3b82f6',
              items: []
            };
          }

          // Só adicionar item se não for um placeholder (elemento vazio)
          if (item.elemento && item.elemento.trim() !== '') {
            const existingItem = groupedData[groupId].items.find(i => i.id === item.id);
            if (!existingItem) {
              const { group_id, group_name, group_color, created_at, updated_at, ...itemData } = item;
              groupedData[groupId].items.push(itemData as ContentItem);
            }
          }
        });

        setGroups(Object.values(groupedData));
      }
    } catch (error) {
      console.error('Error loading content data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContentPadariasToDatabase = async (newGroups: ContentGroup[]) => {
    try {
      const { error: deleteError } = await supabase
        .from('content_padarias_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) throw deleteError;

      // Para cada grupo, se não tiver itens, ainda precisa ser salvo
      const dataToInsert = newGroups.flatMap(group => {
        if (group.items.length === 0) {
          // Se não há itens, criar um registro placeholder para o grupo
          return [{
            id: crypto.randomUUID(),
            group_id: group.id,
            group_name: group.name,
            group_color: group.color,
            elemento: '',
            observacoes: null,
            attachments: null,
            ...Object.fromEntries(
              customColumns.map(col => [col.name, ''])
            )
          }];
        }
        
        return group.items.map(item => ({
          id: item.id,
          group_id: group.id,
          group_name: group.name,
          group_color: group.color,
          elemento: item.elemento,
          observacoes: item.observacoes,
          attachments: item.attachments,
          ...Object.fromEntries(
            customColumns.map(col => [col.name, item[col.name] || ''])
          )
        }));
      });

      if (dataToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('content_padarias_data')
          .insert(dataToInsert);

        if (insertError) throw insertError;
      }

      console.log('Content padarias data saved successfully');
    } catch (error) {
      console.error('Error saving content data:', error);
      throw error;
    }
  };

  const createMonth = async (monthName: string) => {
    const newGroup: ContentGroup = {
      id: crypto.randomUUID(),
      name: monthName,
      isExpanded: true,
      color: '#3b82f6',
      items: []
    };

    const newGroups = [...groups, newGroup];
    setGroups(newGroups);
    await saveContentPadariasToDatabase(newGroups);
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