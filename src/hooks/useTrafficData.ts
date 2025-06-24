import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TrafficItem {
  id: string;
  elemento: string;
  servicos: string;
  observacoes?: string;
  attachments?: { name: string; data: string; type: string; size: number }[];
  [key: string]: any;
}

interface TrafficGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: TrafficItem[];
}

interface Status {
  id: string;
  name: string;
  color: string;
}

interface Column {
  id: string;
  name: string;
  type: 'status' | 'text';
  isDefault: boolean;
}

export const useTrafficData = () => {
  const [groups, setGroups] = useState<TrafficGroup[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([
    { id: 'active', name: 'Ativo', color: 'bg-green-500' },
    { id: 'paused', name: 'Pausado', color: 'bg-yellow-500' },
    { id: 'completed', name: 'Finalizado', color: 'bg-blue-500' }
  ]);
  const [columns, setColumns] = useState<Column[]>([
    { id: 'status', name: 'Status', type: 'status', isDefault: true },
    { id: 'plataforma', name: 'Plataforma', type: 'text', isDefault: true },
    { id: 'campanha', name: 'Campanha', type: 'text', isDefault: true },
    { id: 'investimento', name: 'Investimento', type: 'text', isDefault: true },
    { id: 'retorno', name: 'Retorno', type: 'text', isDefault: true }
  ]);

  const { user } = useAuth();

  // Carregar colunas personalizadas do Supabase
  const loadColumns = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('column_config')
        .select('*')
        .eq('module', 'traffic')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao carregar colunas de tráfego:', error);
        return;
      }

      if (data && data.length > 0) {
        const customColumns = data.map(col => ({
          id: col.column_id,
          name: col.column_name,
          type: col.column_type as 'status' | 'text',
          isDefault: col.is_default || false
        }));

        const defaultColumns = columns.filter(col => col.isDefault);
        setColumns([...defaultColumns, ...customColumns.filter(col => !col.isDefault)]);
      }
    } catch (error) {
      console.error('Erro ao carregar colunas de tráfego:', error);
    }
  };

  // Carregar status personalizados do Supabase
  const loadStatuses = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', 'traffic')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao carregar status de tráfego:', error);
        return;
      }

      if (data && data.length > 0) {
        const customStatuses = data.map(status => ({
          id: status.status_id,
          name: status.status_name,
          color: status.status_color
        }));

        setStatuses(prev => {
          const defaultStatuses = prev.slice(0, 3);
          return [...defaultStatuses, ...customStatuses];
        });
      }
    } catch (error) {
      console.error('Erro ao carregar status de tráfego:', error);
    }
  };

  const loadTrafficData = async () => {
    if (!user?.id) return;
    
    try {
      console.log('Carregando dados de tráfego...');
      
      const { data, error } = await supabase
        .from('traffic_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar dados de tráfego:', error);
        return;
      }

      console.log('Dados carregados:', data);

      if (data && data.length > 0) {
        const groupsMap = new Map<string, TrafficGroup>();

        data.forEach(item => {
          const itemData = typeof item.item_data === 'string' ? JSON.parse(item.item_data) : item.item_data;
          
          if (!groupsMap.has(item.group_id)) {
            groupsMap.set(item.group_id, {
              id: item.group_id,
              name: item.group_name,
              color: item.group_color,
              isExpanded: item.is_expanded,
              items: []
            });
          }

          const group = groupsMap.get(item.group_id)!;
          group.items.push(itemData);
        });

        setGroups(Array.from(groupsMap.values()));
      }
    } catch (error) {
      console.error('Erro ao carregar dados de tráfego:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadTrafficData();
      loadColumns();
      loadStatuses();
    }
  }, [user?.id]);

  // Salvar dados no Supabase
  const saveTrafficToDatabase = async (newGroups: TrafficGroup[]) => {
    if (!user?.id) return;
    
    try {
      console.log('Salvando dados de tráfego...', newGroups);
      
      for (const group of newGroups) {
        // Deletar apenas dados deste grupo específico
        const { error: deleteError } = await supabase
          .from('traffic_data')
          .delete()
          .eq('group_id', group.id)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Erro ao limpar dados do grupo:', deleteError);
        }

        // Inserir dados atualizados do grupo
        if (group.items.length > 0) {
          const insertData = group.items.map(item => ({
            user_id: user.id,
            group_id: group.id,
            group_name: group.name,
            group_color: group.color,
            is_expanded: group.isExpanded,
            item_data: JSON.stringify(item)
          }));

          const { error } = await supabase
            .from('traffic_data')
            .insert(insertData);

          if (error) {
            console.error('Erro ao salvar dados do grupo:', error);
            throw error;
          }
        }
      }
      
      console.log('Dados salvos com sucesso');
    } catch (error) {
      console.error('Erro ao salvar dados de tráfego:', error);
      throw error;
    }
  };

  const updateGroups = async (newGroups: TrafficGroup[]) => {
    setGroups(newGroups);
    await saveTrafficToDatabase(newGroups);
  };

  const createMonth = async (monthName: string) => {
    try {
      const timestamp = Date.now();
      const newGroup: TrafficGroup = {
        id: `${monthName.toLowerCase().replace(/\s+/g, '-')}-trafego-${timestamp}`,
        name: `${monthName} - TRÁFEGO`,
        color: 'bg-orange-500',
        isExpanded: true,
        items: []
      };
      const newGroups = [...groups, newGroup];
      setGroups(newGroups);
      await saveTrafficToDatabase(newGroups);
    } catch (error) {
      console.error('Erro ao criar mês:', error);
      throw error;
    }
  };

  const updateMonth = async (monthId: string, newName: string) => {
    try {
      const newGroups = groups.map(group => 
        group.id === monthId 
          ? { ...group, name: `${newName} - TRÁFEGO` }
          : group
      );
      setGroups(newGroups);
      await saveTrafficToDatabase(newGroups);
    } catch (error) {
      console.error('Erro ao atualizar mês:', error);
      throw error;
    }
  };

  const deleteMonth = async (monthId: string) => {
    try {
      const newGroups = groups.filter(group => group.id !== monthId);
      setGroups(newGroups);
      await saveTrafficToDatabase(newGroups);
    } catch (error) {
      console.error('Erro ao deletar mês:', error);
      throw error;
    }
  };

  const duplicateMonth = async (sourceGroupId: string, newName: string) => {
    try {
      console.log('Iniciando duplicação de mês de tráfego:', { sourceGroupId, newName });
      
      const sourceGroup = groups.find(g => g.id === sourceGroupId);
      if (!sourceGroup) {
        throw new Error('Grupo não encontrado');
      }

      const timestamp = Date.now();
      const newGroup: TrafficGroup = {
        id: `${newName.toLowerCase().replace(/\s+/g, '-')}-trafego-${timestamp}`,
        name: `${newName} - TRÁFEGO`,
        color: sourceGroup.color,
        isExpanded: true,
        items: sourceGroup.items.map(item => ({
          ...item,
          id: `traffic-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
          observacoes: '',
          attachments: []
        }))
      };

      const newGroups = [...groups, newGroup];
      setGroups(newGroups);
      await saveTrafficToDatabase(newGroups);
      
      console.log('Mês duplicado com sucesso');
      return newGroup.id;
    } catch (error) {
      console.error('Erro ao duplicar mês de tráfego:', error);
      throw error;
    }
  };

  const addStatus = async (status: Status) => {
    try {
      setStatuses(prev => [...prev, status]);
      
      // Salvar no Supabase
      const { error } = await supabase
        .from('status_config')
        .insert({
          status_id: status.id,
          status_name: status.name,
          status_color: status.color,
          module: 'traffic',
          user_id: user?.id
        });

      if (error) {
        console.error('Erro ao salvar status:', error);
        setStatuses(prev => prev.filter(s => s.id !== status.id));
        throw error;
      }
    } catch (error) {
      console.error('Erro ao adicionar status:', error);
      throw error;
    }
  };

  const updateStatus = async (statusId: string, updates: Partial<Status>) => {
    try {
      setStatuses(prev => prev.map(status => 
        status.id === statusId ? { ...status, ...updates } : status
      ));

      // Atualizar no Supabase
      const { error } = await supabase
        .from('status_config')
        .update({
          status_name: updates.name,
          status_color: updates.color
        })
        .eq('status_id', statusId)
        .eq('module', 'traffic')
        .eq('user_id', user?.id);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        loadStatuses();
        throw error;
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  };

  const deleteStatus = async (statusId: string) => {
    try {
      setStatuses(prev => prev.filter(status => status.id !== statusId));

      // Deletar do Supabase
      const { error } = await supabase
        .from('status_config')
        .delete()
        .eq('status_id', statusId)
        .eq('module', 'traffic')
        .eq('user_id', user?.id);

      if (error) {
        console.error('Erro ao deletar status:', error);
        loadStatuses();
        throw error;
      }
    } catch (error) {
      console.error('Erro ao deletar status:', error);
      throw error;
    }
  };

  const addColumn = async (columnName: string, columnType: 'status' | 'text') => {
    try {
      const newColumn: Column = {
        id: columnName.toLowerCase().replace(/\s+/g, '_'),
        name: columnName,
        type: columnType,
        isDefault: false
      };
      
      setColumns(prev => [...prev, newColumn]);

      // Salvar no Supabase
      const { error } = await supabase
        .from('column_config')
        .insert({
          column_id: newColumn.id,
          column_name: newColumn.name,
          column_type: newColumn.type,
          module: 'traffic',
          is_default: false,
          user_id: user?.id
        });

      if (error) {
        console.error('Erro ao salvar coluna:', error);
        setColumns(prev => prev.filter(col => col.id !== newColumn.id));
        throw error;
      }
    } catch (error) {
      console.error('Erro ao adicionar coluna:', error);
      throw error;
    }
  };

  const updateColumn = async (columnId: string, updates: Partial<Column>) => {
    try {
      setColumns(prev => prev.map(column => 
        column.id === columnId ? { ...column, ...updates } : column
      ));

      // Atualizar no Supabase
      const { error } = await supabase
        .from('column_config')
        .update({
          column_name: updates.name,
          column_type: updates.type
        })
        .eq('column_id', columnId)
        .eq('module', 'traffic')
        .eq('user_id', user?.id);

      if (error) {
        console.error('Erro ao atualizar coluna:', error);
        loadColumns();
        throw error;
      }
    } catch (error) {
      console.error('Erro ao atualizar coluna:', error);
      throw error;
    }
  };

  const deleteColumn = async (columnId: string) => {
    try {
      setColumns(prev => prev.filter(column => column.id !== columnId));

      // Deletar do Supabase
      const { error } = await supabase
        .from('column_config')
        .delete()
        .eq('column_id', columnId)
        .eq('module', 'traffic')
        .eq('user_id', user?.id);

      if (error) {
        console.error('Erro ao deletar coluna:', error);
        loadColumns();
        throw error;
      }
    } catch (error) {
      console.error('Erro ao deletar coluna:', error);
      throw error;
    }
  };

  const updateItemStatus = async (itemId: string, columnId: string, statusId: string) => {
    try {
      const newGroups = groups.map(group => ({
        ...group,
        items: group.items.map(item => 
          item.id === itemId ? { ...item, [columnId]: statusId } : item
        )
      }));
      setGroups(newGroups);
      await saveTrafficToDatabase(newGroups);
    } catch (error) {
      console.error('Erro ao atualizar status do item:', error);
    }
  };

  const addClient = async (groupId: string, clientData: { elemento: string; servicos: string }) => {
    try {
      const newItem: TrafficItem = {
        id: `traffic-${Date.now()}`,
        elemento: clientData.elemento,
        servicos: clientData.servicos,
        observacoes: '',
        attachments: []
      };

      const newGroups = groups.map(group => 
        group.id === groupId 
          ? { ...group, items: [...group.items, newItem] }
          : group
      );
      setGroups(newGroups);
      await saveTrafficToDatabase(newGroups);
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      const newGroups = groups.map(group => ({
        ...group,
        items: group.items.filter(item => item.id !== clientId)
      }));
      setGroups(newGroups);
      await saveTrafficToDatabase(newGroups);
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
    }
  };

  const updateClient = async (clientId: string, updates: any) => {
    try {
      // Corrigir tratamento de arquivos
      if (updates.attachments && updates.attachments.length > 0) {
        const firstAttachment = updates.attachments[0];
        if (firstAttachment instanceof File) {
          const reader = new FileReader();
          reader.onload = async () => {
            const serializedFile = {
              name: firstAttachment.name,
              data: reader.result as string,
              type: firstAttachment.type,
              size: firstAttachment.size
            };
            updates.attachments = [serializedFile];
            
            const newGroups = groups.map(group => ({
              ...group,
              items: group.items.map(item => 
                item.id === clientId ? { ...item, ...updates } : item
              )
            }));
            
            setGroups(newGroups);
            await saveTrafficToDatabase(newGroups);
          };
          reader.readAsDataURL(firstAttachment);
          return;
        }
      }

      const newGroups = groups.map(group => ({
        ...group,
        items: group.items.map(item => 
          item.id === clientId ? { ...item, ...updates } : item
        )
      }));
      setGroups(newGroups);
      await saveTrafficToDatabase(newGroups);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
    }
  };

  const getClientFiles = (clientId: string): File[] => {
    for (const group of groups) {
      const client = group.items.find(item => item.id === clientId);
      if (client && client.attachments) {
        return client.attachments.map(attachment => {
          try {
            // Verificar se os dados estão válidos
            if (!attachment.data || !attachment.data.includes(',')) {
              console.error('Dados de arquivo inválidos:', attachment);
              return null;
            }
            
            const byteCharacters = atob(attachment.data.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            return new File([byteArray], attachment.name, { type: attachment.type });
          } catch (error) {
            console.error('Erro ao processar arquivo:', error, attachment);
            return null;
          }
        }).filter(file => file !== null) as File[];
      }
    }
    return [];
  };

  return {
    groups,
    columns,
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
    updateItemStatus,
    addClient,
    deleteClient,
    updateClient,
    getClientFiles
  };
};
