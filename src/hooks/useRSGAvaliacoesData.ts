import { useState, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RSGAvaliacoesItem {
  id: string;
  [key: string]: any;
}

export interface RSGAvaliacoesColumn {
  id: string;
  name: string;
  type: string;
}

export interface RSGAvaliacoesStatus {
  id: string;
  name: string;
  color: string;
}

export interface RSGAvaliacoesGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: RSGAvaliacoesItem[];
}

const MODULE_NAME = 'rsg_avaliacoes';

const useRSGAvaliacoesData = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Buscar configurações de colunas
  const { data: columns = [] } = useQuery({
    queryKey: ['column-config', MODULE_NAME],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('column_config')
        .select('*')
        .eq('module', MODULE_NAME)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data?.map(col => ({
        id: col.column_id,
        name: col.column_name,
        type: col.column_type
      })) || [];
    }
  });

  // Buscar configurações de status
  const { data: statuses = [] } = useQuery({
    queryKey: ['status-config', MODULE_NAME],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('status_config')
        .select('*')
        .eq('module', MODULE_NAME)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data?.map(status => ({
        id: status.status_id,
        name: status.status_name,
        color: status.status_color
      })) || [];
    }
  });

  // Buscar dados principais
  const { data: groups = [], isLoading: isLoadingGroups, refetch } = useQuery({
    queryKey: ['rsg-avaliacoes-data'],
    queryFn: async () => {
      console.log('🔄 RSG Avaliações: Carregando dados');
      
      const { data, error } = await (supabase as any)
        .from('rsg_avaliacoes_data')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ RSG Avaliações: Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados do RSG Avaliações');
        throw error;
      }

      console.log('✅ RSG Avaliações: Dados carregados:', data?.length || 0, 'registros');

      if (data && data.length > 0) {
        const groupsMap = new Map<string, RSGAvaliacoesGroup>();

        data.forEach((item: any, index: number) => {
          console.log(`🔍 RSG Avaliações: Processando item ${index + 1}:`, {
            group_id: item.group_id,
            item_data_preview: JSON.stringify(item.item_data).substring(0, 100)
          });
          
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
          group.items.push(item.item_data);
        });

        return Array.from(groupsMap.values());
      }

      const columnsList = await queryClient.getQueryData(['column-config', MODULE_NAME]) as RSGAvaliacoesColumn[] || [];
      
      if (columnsList.length === 0) {
        const newGroupsMap = new Map<string, RSGAvaliacoesGroup>();
        const existingGroup = newGroupsMap.get('default-group');
        if (!existingGroup) {
          newGroupsMap.set('default-group', {
            id: 'default-group',
            name: 'Mês Padrão',
            color: 'bg-purple-500',
            isExpanded: true,
            items: []
          });
        }
        return Array.from(newGroupsMap.values());
      }

      console.log('📊 RSG Avaliações: Dados processados - usando default');
      return [];
    }
  });

  // Salvar dados com proteção anti-duplicação
  const saveDataMutation = useMutation({
    mutationFn: async (groups: RSGAvaliacoesGroup[]) => {
      console.log('💾 RSG Avaliações: Iniciando salvamento de', groups.length, 'grupos');
      
      for (const group of groups) {
        console.log(`🔄 RSG Avaliações: Processando grupo: ${group.name} (${group.items.length} itens)`);
        
        // Filtrar itens únicos baseado no nome do cliente e serviços
        const processedClients = new Set<string>();
        const uniqueItems = group.items.filter(item => {
          const clientKey = `${item.elemento?.trim()}-${item.servicos?.trim()}`;
          
          // Pular se cliente está vazio ou já foi processado
          if (!item.elemento?.trim() || processedClients.has(clientKey)) {
            console.log(`⚠️ RSG Avaliações: Cliente duplicado ou vazio ignorado: ${item.elemento}`);
            return false;
          }
          
          processedClients.add(clientKey);
          return true;
        });

        const insertData = uniqueItems.map(item => ({
          user_id: null,
          group_id: group.id,
          group_name: group.name,
          group_color: group.color,
          is_expanded: group.isExpanded,
          item_data: item
        }));

        console.log('📥 RSG Avaliações: Inserindo dados únicos:', {
          groupId: group.id,
          groupName: group.name,
          originalCount: group.items.length,
          uniqueCount: insertData.length
        });

        // PRIMEIRO inserir os novos dados se houver itens
        if (insertData.length > 0) {
          const { data: insertResult, error: insertError } = await (supabase as any)
            .from('rsg_avaliacoes_data')
            .insert(insertData)
            .select('id');

          if (insertError) {
            console.error('❌ RSG Avaliações: Erro ao inserir dados:', insertError);
            throw insertError;
          }

          console.log('✅ RSG Avaliações: Dados inseridos com sucesso:', insertResult?.length || 0, 'registros');

          // SÓ DEPOIS deletar os dados antigos do grupo (exceto os recém inseridos)
          const newRecordIds = insertResult?.map(record => record.id) || [];
          if (newRecordIds.length > 0) {
            const { error: deleteError } = await (supabase as any)
              .from('rsg_avaliacoes_data')
              .delete()
              .eq('group_id', group.id)
              .not('id', 'in', `(${newRecordIds.map(id => `'${id}'`).join(',')})`);

            if (deleteError) {
              console.error('❌ RSG Avaliações: Erro ao deletar dados antigos:', deleteError);
              // Não fazer throw aqui pois os novos dados já foram salvos
            }
          }
        } else {
          // Se não há itens para inserir, deletar todos os dados existentes do grupo
          const { error: deleteError } = await (supabase as any)
            .from('rsg_avaliacoes_data')
            .delete()
            .eq('group_id', group.id);

          if (deleteError) {
            console.error('❌ RSG Avaliações: Erro ao deletar todos os dados do grupo:', deleteError);
            throw deleteError;
          }
        }
      }

      console.log('🎉 RSG Avaliações: Salvamento concluído com sucesso');
      return groups;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rsg-avaliacoes-data'] });
      toast.success('Dados do RSG Avaliações salvos com sucesso!');
    },
    onError: (error) => {
      console.error('❌ RSG Avaliações: Erro ao salvar dados:', error);
      toast.error('Erro ao salvar dados do RSG Avaliações');
    }
  });

  const saveData = useCallback((groups: RSGAvaliacoesGroup[]) => {
    console.log('🔄 RSG Avaliações: Solicitação de salvamento recebida');
    saveDataMutation.mutate(groups);
  }, [saveDataMutation]);

  // Mutação para criar coluna
  const createColumnMutation = useMutation({
    mutationFn: async ({ name, type }: { name: string; type: string }) => {
      const columnId = `col_${Date.now()}`;
      const { data, error } = await supabase
        .from('column_config')
        .insert({
          module: MODULE_NAME,
          column_id: columnId,
          column_name: name,
          column_type: type,
          user_id: null,
          is_default: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['column-config', MODULE_NAME] });
      toast.success('Coluna criada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar coluna');
    }
  });

  // Mutação para deletar coluna
  const deleteColumnMutation = useMutation({
    mutationFn: async (columnId: string) => {
      const { error } = await supabase
        .from('column_config')
        .delete()
        .eq('column_id', columnId)
        .eq('module', MODULE_NAME);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['column-config', MODULE_NAME] });
      toast.success('Coluna deletada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao deletar coluna');
    }
  });

  // Mutação para criar status
  const createStatusMutation = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const statusId = `status_${Date.now()}`;
      const { data, error } = await supabase
        .from('status_config')
        .insert({
          module: MODULE_NAME,
          status_id: statusId,
          status_name: name,
          status_color: color,
          user_id: null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-config', MODULE_NAME] });
      toast.success('Status criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar status');
    }
  });

  // Mutação para deletar status
  const deleteStatusMutation = useMutation({
    mutationFn: async (statusId: string) => {
      const { error } = await supabase
        .from('status_config')
        .delete()
        .eq('status_id', statusId)
        .eq('module', MODULE_NAME);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-config', MODULE_NAME] });
      toast.success('Status deletado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao deletar status');
    }
  });

  const createColumn = useCallback((name: string, type: string) => {
    createColumnMutation.mutate({ name, type });
  }, [createColumnMutation]);

  const deleteColumn = useCallback((columnId: string) => {
    deleteColumnMutation.mutate(columnId);
  }, [deleteColumnMutation]);

  const createStatus = useCallback((name: string, color: string) => {
    createStatusMutation.mutate({ name, color });
  }, [createStatusMutation]);

  const deleteStatus = useCallback((statusId: string) => {
    deleteStatusMutation.mutate(statusId);
  }, [deleteStatusMutation]);

  const updateGroup = useCallback((groupId: string, updates: Partial<RSGAvaliacoesGroup>) => {
    const currentGroups = queryClient.getQueryData(['rsg-avaliacoes-data']) as RSGAvaliacoesGroup[] || [];
    const updatedGroups = currentGroups.map(group => 
      group.id === groupId ? { ...group, ...updates } : group
    );
    queryClient.setQueryData(['rsg-avaliacoes-data'], updatedGroups);
    saveData(updatedGroups);
  }, [queryClient, saveData]);

  return {
    // Dados
    groups,
    columns,
    statuses,
    
    // Estados
    isLoading: isLoading || isLoadingGroups || saveDataMutation.isPending,
    
    // Ações
    saveData,
    createColumn,
    deleteColumn,
    createStatus,
    deleteStatus,
    updateGroup,
    refetch,
    
    // Mutations para controle externo
    saveDataMutation,
    createColumnMutation,
    deleteColumnMutation,
    createStatusMutation,
    deleteStatusMutation,
    
    // Novos métodos específicos
    createGroup: async (name: string, color: string = 'bg-purple-500') => {
      try {
        const currentGroups = queryClient.getQueryData(['rsg-avaliacoes-data']) as RSGAvaliacoesGroup[] || [];
        const newGroupId = `group_${Date.now()}`;
        const newGroup: RSGAvaliacoesGroup = {
          id: newGroupId,
          name,
          color,
          isExpanded: true,
          items: []
        };
        
        // Criar um item vazio para o grupo
        const emptyItem = {
          id: `empty-${newGroupId}`,
          elemento: '',
          servicos: '',
          attachments: [],
          informacoes: '',
          observacoes: ''
        };

        // Inserir no banco de dados
        const { error } = await (supabase as any)
          .from('rsg_avaliacoes_data')
          .insert({
            group_id: newGroupId,
            group_name: name,
            group_color: color,
            is_expanded: true,
            item_data: emptyItem
          });

        if (error) throw error;

        // Atualizar cache local
        const updatedGroups = [...currentGroups, { ...newGroup, items: [emptyItem] }];
        queryClient.setQueryData(['rsg-avaliacoes-data'], updatedGroups);
        
        toast.success('Mês criado com sucesso!');
      } catch (error) {
        console.error('Erro ao criar mês:', error);
        toast.error('Erro ao criar mês');
      }
    },
    
    duplicateGroup: async (sourceGroupId: string, newName: string) => {
      try {
        const currentGroups = queryClient.getQueryData(['rsg-avaliacoes-data']) as RSGAvaliacoesGroup[] || [];
        const sourceGroup = currentGroups.find(g => g.id === sourceGroupId);
        
        if (!sourceGroup) {
          toast.error('Grupo não encontrado');
          return;
        }

        const newGroupId = `group_${Date.now()}`;
        
        // Duplicar cada item do grupo com novos IDs para evitar conflitos
        const duplicatedItems = sourceGroup.items.map(item => ({
          ...item,
          id: `rsg-client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));

        // Inserir todos os itens duplicados no banco
        const insertPromises = duplicatedItems.map(item => 
          (supabase as any)
            .from('rsg_avaliacoes_data')
            .insert({
              group_id: newGroupId,
              group_name: newName,
              group_color: sourceGroup.color,
              is_expanded: true,
              item_data: item
            })
        );

        await Promise.all(insertPromises);

        // Atualizar cache local
        const newGroup: RSGAvaliacoesGroup = {
          id: newGroupId,
          name: newName,
          color: sourceGroup.color,
          isExpanded: true,
          items: duplicatedItems
        };
        
        const updatedGroups = [...currentGroups, newGroup];
        queryClient.setQueryData(['rsg-avaliacoes-data'], updatedGroups);
        
        toast.success('Mês duplicado com sucesso!');
      } catch (error) {
        console.error('Erro ao duplicar mês:', error);
        toast.error('Erro ao duplicar mês');
      }
    },
    
    deleteMonth: async (groupId: string) => {
      try {
        const { error } = await (supabase as any)
          .from('rsg_avaliacoes_data')
          .delete()
          .eq('group_id', groupId);

        if (error) throw error;

        const currentGroups = queryClient.getQueryData(['rsg-avaliacoes-data']) as RSGAvaliacoesGroup[] || [];
        const updatedGroups = currentGroups.filter(group => group.id !== groupId);
        queryClient.setQueryData(['rsg-avaliacoes-data'], updatedGroups);
        
        toast.success('Mês deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar mês:', error);
        toast.error('Erro ao deletar mês');
      }
    }
  };
};

export default useRSGAvaliacoesData;