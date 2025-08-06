import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './useAuth';

export interface ServiceStatus {
  id: string;
  name: string;
  color: string;
}

export interface VideoItem {
  id: string;
  elemento: string;
  [key: string]: any;
}

export interface VideoGroup {
  id: string;
  name: string;
  isExpanded: boolean;
  color: string;
  items: VideoItem[];
}

export interface VideoColumn {
  id: string;
  name: string;
  type: 'status' | 'text';
}

export function useVideosData() {
  const [groups, setGroups] = useState<VideoGroup[]>([]);
  const [columns, setColumns] = useState<string[]>(['elemento', 'servico1', 'servico2', 'servico3', 'servico4', 'servico5']);
  const [customColumns, setCustomColumns] = useState<VideoColumn[]>([]);
  const [statuses, setStatuses] = useState<ServiceStatus[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadVideosData();
      loadColumns();
      loadStatuses();
    }
  }, [user]);

  const loadColumns = async () => {
    try {
      const { data, error } = await supabase
        .from('column_config')
        .select('*')
        .eq('module', 'videos')
        .order('created_at');

      if (error) throw error;

      const formattedColumns = data?.map(col => ({
        id: col.column_id,
        name: col.column_name,
        type: col.column_type as 'status' | 'text'
      })) || [];
      setCustomColumns(formattedColumns);
    } catch (error) {
      console.error('Error loading columns:', error);
    }
  };

  const loadStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'videos')
        .order('created_at');

      if (error) throw error;

      const formattedStatuses = data?.map(status => ({
        id: status.status_id,
        name: status.status_name,
        color: status.status_color
      })) || [];
      setStatuses(formattedStatuses);
    } catch (error) {
      console.error('Error loading statuses:', error);
    }
  };

  const loadVideosData = async () => {
    try {
      console.log('🔄 VIDEOS: Carregando dados globais');
      
      const { data, error } = await supabase
        .from('videos_data')
        .select('*')
        .order('created_at', { ascending: true });

      console.log('📊 VIDEOS: Resposta dados:', { 
        dataLength: data?.length || 0, 
        error,
        sampleData: data?.[0] 
      });

      if (error) {
        console.error('❌ VIDEOS: Erro ao carregar dados:', error);
        return;
      }

      if (data && data.length > 0) {
        const groupsMap = new Map<string, VideoGroup>();
        const seenItems = new Set<string>(); // Track unique combinations

        data.forEach((item, index) => {
          console.log(`🔍 VIDEOS: Processando item ${index + 1}:`, {
            group_id: item.group_id,
            item_data_type: typeof item.item_data,
            item_data_preview: JSON.stringify(item.item_data).substring(0, 100)
          });

          let itemData;
          try {
            if (typeof item.item_data === 'string') {
              itemData = JSON.parse(item.item_data);
            } else {
              itemData = item.item_data;
            }
          } catch (parseError) {
            console.error('❌ VIDEOS: Erro ao fazer parse do item_data:', parseError);
            return;
          }
          
          // Create unique key based on actual item ID to detect real duplicates
          const uniqueKey = `${item.group_id}-${itemData?.id}`;
          
          if (seenItems.has(uniqueKey)) {
            console.warn('⚠️ VIDEOS: Item duplicado detectado e ignorado:', uniqueKey);
            return;
          }
          
          seenItems.add(uniqueKey);
          
          if (!groupsMap.has(item.group_id)) {
            groupsMap.set(item.group_id, {
              id: item.group_id,
              name: item.group_name,
              color: item.group_color || 'bg-purple-500',
              isExpanded: item.is_expanded,
              items: []
            });
          }

          const group = groupsMap.get(item.group_id)!;
          if (itemData && itemData.id && itemData.id !== `empty-${item.group_id}`) {
            group.items.push({
              id: itemData.id,
              elemento: itemData.elemento || '',
              ...itemData
            });
          }
        });

        const loadedGroups = Array.from(groupsMap.values());
        console.log('✅ VIDEOS: Grupos carregados:', {
          totalGroups: loadedGroups.length,
          groupDetails: loadedGroups.map(g => ({ name: g.name, itemCount: g.items.length }))
        });
        setGroups(loadedGroups);
      } else {
        console.log('ℹ️ VIDEOS: Nenhum dado encontrado');
        setGroups([]);
      }
    } catch (error) {
      console.error('❌ VIDEOS: Erro crítico ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos vídeos.",
        variant: "destructive",
      });
    }
  };

  const saveVideosToDatabase = async (newGroups: VideoGroup[]) => {
    try {
      console.log('🔄 VIDEOS: Iniciando salvamento:', {
        groupCount: newGroups.length,
        totalItems: newGroups.reduce((acc, g) => acc + g.items.length, 0)
      });
      
      for (const group of newGroups) {
        console.log(`🔄 VIDEOS: Processando grupo: ${group.name} (${group.items.length} itens)`);
        
        // Deletar dados existentes do grupo específico
        const { error: deleteError } = await supabase
          .from('videos_data')
          .delete()
          .eq('group_id', group.id);

        if (deleteError) {
          console.error('❌ VIDEOS: Erro ao deletar:', deleteError);
          throw deleteError;
        }

        // Sempre inserir dados do grupo
        const insertData = group.items.length > 0 
          ? group.items.map((item, index) => {
              console.log(`📝 VIDEOS: Preparando item ${index + 1}:`, {
                id: item.id,
                elemento: item.elemento
              });

              return {
                user_id: null, // Sempre null para tornar global
                group_id: group.id,
                group_name: group.name,
                group_color: group.color,
                is_expanded: group.isExpanded,
                item_data: item
              };
            })
          : [{
              user_id: null, // Sempre null para tornar global
              group_id: group.id,
              group_name: group.name,
              group_color: group.color,
              is_expanded: group.isExpanded,
              item_data: {
                id: `empty-${group.id}`,
                elemento: '',
                attachments: []
              }
            }];

        const { data: insertResult, error: insertError } = await supabase
          .from('videos_data')
          .insert(insertData)
          .select('id');

        if (insertError) {
          console.error('❌ VIDEOS: Erro ao inserir:', insertError);
          throw insertError;
        }

        console.log('✅ VIDEOS: Dados inseridos:', insertResult?.length || 0);
      }

      toast({
        title: "Sucesso",
        description: "Dados dos vídeos salvos com sucesso!",
      });
    } catch (error) {
      console.error('Error saving videos data:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar os dados dos vídeos.",
        variant: "destructive",
      });
    }
  };

  const createMonth = async (monthName: string) => {
    const newGroupId = crypto.randomUUID();
    const newGroup: VideoGroup = {
      id: newGroupId,
      name: monthName,
      isExpanded: true,
      color: 'bg-purple-500',
      items: []
    };

    const newGroups = [...groups, newGroup];
    setGroups(newGroups);
    await saveVideosToDatabase(newGroups);
    return newGroupId;
  };

  const addClient = async (groupId: string, clientData: Partial<VideoItem>) => {
    const newItemId = crypto.randomUUID();
    const newItem: VideoItem = {
      id: newItemId,
      elemento: clientData.elemento || '',
      ...clientData
    };

    const isDuplicate = groups.some(group => 
      group.items.some(item => 
        item.elemento.toLowerCase() === newItem.elemento.toLowerCase()
      )
    );

    if (isDuplicate) {
      toast({
        title: "Cliente já existe",
        description: "Um cliente com este nome já existe.",
        variant: "destructive",
      });
      return newItemId;
    }

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
    await saveVideosToDatabase(newGroups);
    return newItemId;
  };

  const addColumn = async (name: string, type: 'status' | 'text') => {
    try {
      const newColumn = {
        module: 'videos',
        column_id: crypto.randomUUID(),
        column_name: name,
        column_type: type,
        user_id: null // Sempre null para tornar global
      };

      const { error } = await supabase
        .from('column_config')
        .insert(newColumn);

      if (error) throw error;

      await loadColumns();
      
      const newGroups = groups.map(group => ({
        ...group,
        items: group.items.map(item => ({
          ...item,
          [name]: type === 'status' ? '' : ''
        }))
      }));

      setGroups(newGroups);
      await saveVideosToDatabase(newGroups);
    } catch (error) {
      console.error('Error adding column:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar coluna.",
        variant: "destructive",
      });
    }
  };

  const addStatus = async (status: ServiceStatus) => {
    try {
      const { error } = await supabase
        .from('status_config')
        .insert({
          module: 'videos',
          status_id: status.id,
          status_name: status.name,
          status_color: status.color,
          user_id: null // Sempre null para tornar global
        });

      if (error) throw error;
      await loadStatuses();
    } catch (error) {
      console.error('Error adding status:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar status.",
        variant: "destructive",
      });
    }
  };

  const updateStatus = async (statusId: string, updates: Partial<ServiceStatus>) => {
    try {
      const { error } = await supabase
        .from('status_config')
        .update({
          status_name: updates.name,
          status_color: updates.color
        })
        .eq('status_id', statusId)
        .eq('module', 'videos');

      if (error) throw error;
      await loadStatuses();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status.",
        variant: "destructive",
      });
    }
  };

  const deleteStatus = async (statusId: string) => {
    try {
      const { error } = await supabase
        .from('status_config')
        .delete()
        .eq('status_id', statusId)
        .eq('module', 'videos');

      if (error) throw error;
      await loadStatuses();
    } catch (error) {
      console.error('Error deleting status:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar status.",
        variant: "destructive",
      });
    }
  };

  const updateColumn = async (id: string, updates: Partial<VideoColumn>) => {
    try {
      const { error } = await supabase
        .from('column_config')
        .update({
          column_name: updates.name,
          column_type: updates.type
        })
        .eq('column_id', id)
        .eq('module', 'videos');

      if (error) throw error;
      await loadColumns();
    } catch (error) {
      console.error('Error updating column:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar coluna.",
        variant: "destructive",
      });
    }
  };

  const deleteColumn = async (id: string) => {
    try {
      const columnToDelete = customColumns.find(col => col.id === id);
      if (!columnToDelete) return;

      const { error } = await supabase
        .from('column_config')
        .delete()
        .eq('column_id', id)
        .eq('module', 'videos');

      if (error) throw error;

      const newGroups = groups.map(group => ({
        ...group,
        items: group.items.map(item => {
          const { [columnToDelete.name]: removed, ...rest } = item;
          return { id: rest.id || crypto.randomUUID(), elemento: rest.elemento || '', ...rest };
        })
      }));

      setGroups(newGroups);
      await saveVideosToDatabase(newGroups);
      await loadColumns();
    } catch (error) {
      console.error('Error deleting column:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar coluna.",
        variant: "destructive",
      });
    }
  };

  const updateItemStatus = async (itemId: string, field: string, statusId: string) => {
    const newGroups = groups.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId ? { ...item, [field]: statusId } : item
      )
    }));

    setGroups(newGroups);
    await saveVideosToDatabase(newGroups);
  };

  const deleteClient = async (itemId: string) => {
    const newGroups = groups.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== itemId)
    }));

    setGroups(newGroups);
    await saveVideosToDatabase(newGroups);
  };

  const updateClient = async (itemId: string, updates: Partial<VideoItem>) => {
    const newGroups = groups.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    }));

    setGroups(newGroups);
    await saveVideosToDatabase(newGroups);
  };

  const getClientFiles = (clientId: string): File[] => {
    return [];
  };

  const updateGroups = async (newGroups: VideoGroup[]) => {
    setGroups(newGroups);
    await saveVideosToDatabase(newGroups);
  };

  const updateMonth = async (groupId: string, newName: string) => {
    const newGroups = groups.map(group => 
      group.id === groupId ? { ...group, name: newName } : group
    );
    setGroups(newGroups);
    await saveVideosToDatabase(newGroups);
  };

  const deleteMonth = async (groupId: string) => {
    const newGroups = groups.filter(group => group.id !== groupId);
    setGroups(newGroups);
    await saveVideosToDatabase(newGroups);
  };

  const duplicateMonth = async (sourceGroupId: string, newMonthName: string) => {
    const sourceGroup = groups.find(g => g.id === sourceGroupId);
    if (!sourceGroup) return '';

    const newGroupId = crypto.randomUUID();
    const duplicatedGroup: VideoGroup = {
      ...sourceGroup,
      id: newGroupId,
      name: newMonthName,
      items: sourceGroup.items.map(item => ({
        ...item,
        id: crypto.randomUUID()
      }))
    };

    const newGroups = [...groups, duplicatedGroup];
    setGroups(newGroups);
    await saveVideosToDatabase(newGroups);
    return newGroupId;
  };

  return {
    groups,
    columns,
    customColumns,
    statuses,
    createMonth,
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
    duplicateMonth
  };
}