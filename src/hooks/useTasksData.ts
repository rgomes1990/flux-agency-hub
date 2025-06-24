
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  attachments?: {name: string; size: number; type: string; data: string}[];
}

interface TaskColumn {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  order: number;
}

export const useTasksData = () => {
  const [columns, setColumns] = useState<TaskColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Carregar colunas e tarefas do Supabase
  const loadTasksData = async () => {
    if (!user?.id) {
      console.log('Usuário não logado, definindo colunas padrão');
      setLoading(false);
      return;
    }

    try {
      console.log('Carregando dados de tarefas para usuário:', user.id);
      setLoading(true);

      // Carregar configurações de colunas
      const { data: columnData, error: columnError } = await supabase
        .from('task_columns')
        .select('*')
        .eq('user_id', user.id)
        .order('column_order', { ascending: true });

      if (columnError) {
        console.error('Erro ao carregar colunas:', columnError);
        throw columnError;
      }

      // Carregar dados de tarefas
      const { data: taskData, error: taskError } = await supabase
        .from('tasks_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (taskError) {
        console.error('Erro ao carregar tarefas:', taskError);
        throw taskError;
      }

      console.log('Dados carregados - Colunas:', columnData?.length || 0, 'Tarefas:', taskData?.length || 0);

      // Se não há configurações de colunas, criar padrões
      if (!columnData || columnData.length === 0) {
        console.log('Criando colunas padrão...');
        const defaultColumns: TaskColumn[] = [
          { id: 'todo', title: 'A Fazer', color: 'bg-gray-100', tasks: [], order: 0 },
          { id: 'doing', title: 'Fazendo', color: 'bg-blue-100', tasks: [], order: 1 },
          { id: 'done', title: 'Feito', color: 'bg-green-100', tasks: [], order: 2 }
        ];
        
        await saveColumnsToDatabase(defaultColumns);
        setColumns(defaultColumns);
        setLoading(false);
        return;
      }

      // Organizar colunas e tarefas
      const columnsMap = new Map<string, TaskColumn>();
      
      // Criar colunas
      columnData.forEach(col => {
        columnsMap.set(col.column_id, {
          id: col.column_id,
          title: col.column_title,
          color: col.column_color,
          tasks: [],
          order: col.column_order
        });
      });

      // Adicionar tarefas às colunas
      if (taskData && taskData.length > 0) {
        taskData.forEach(taskRow => {
          try {
            const taskInfo = typeof taskRow.task_data === 'string' 
              ? JSON.parse(taskRow.task_data) 
              : taskRow.task_data;
            
            const column = columnsMap.get(taskRow.column_id);
            if (column && taskInfo) {
              column.tasks.push(taskInfo);
            }
          } catch (error) {
            console.error('Erro ao processar tarefa:', taskRow, error);
          }
        });
      }

      const finalColumns = Array.from(columnsMap.values()).sort((a, b) => a.order - b.order);
      console.log('Colunas finais:', finalColumns);
      setColumns(finalColumns);
    } catch (error) {
      console.error('Erro ao carregar dados de tarefas:', error);
      // Em caso de erro, definir colunas padrão
      const defaultColumns: TaskColumn[] = [
        { id: 'todo', title: 'A Fazer', color: 'bg-gray-100', tasks: [], order: 0 },
        { id: 'doing', title: 'Fazendo', color: 'bg-blue-100', tasks: [], order: 1 },
        { id: 'done', title: 'Feito', color: 'bg-green-100', tasks: [], order: 2 }
      ];
      setColumns(defaultColumns);
    } finally {
      setLoading(false);
    }
  };

  // Salvar configurações de colunas no Supabase
  const saveColumnsToDatabase = async (newColumns: TaskColumn[]) => {
    if (!user?.id) {
      console.error('Usuário não logado - não é possível salvar colunas');
      return;
    }

    try {
      console.log('Salvando configurações de colunas...', newColumns);

      // Deletar configurações antigas
      const { error: deleteError } = await supabase
        .from('task_columns')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Erro ao deletar colunas antigas:', deleteError);
      }

      // Inserir novas configurações
      const columnInserts = newColumns.map(col => ({
        user_id: user.id,
        column_id: col.id,
        column_title: col.title,
        column_color: col.color,
        column_order: col.order
      }));

      const { error: insertError } = await supabase
        .from('task_columns')
        .insert(columnInserts);

      if (insertError) {
        console.error('Erro ao salvar colunas:', insertError);
        throw insertError;
      }

      console.log('Configurações de colunas salvas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar configurações de colunas:', error);
      throw error;
    }
  };

  // Salvar tarefas no Supabase
  const saveTasksToDatabase = async (newColumns: TaskColumn[]) => {
    if (!user?.id) {
      console.error('Usuário não logado - não é possível salvar tarefas');
      return;
    }

    try {
      console.log('Salvando tarefas no banco...', newColumns);

      // Deletar tarefas antigas
      const { error: deleteError } = await supabase
        .from('tasks_data')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Erro ao deletar tarefas antigas:', deleteError);
      }

      // Inserir novas tarefas
      const taskInserts: any[] = [];
      newColumns.forEach(column => {
        column.tasks.forEach(task => {
          taskInserts.push({
            user_id: user.id,
            column_id: column.id,
            column_title: column.title,
            column_color: column.color,
            task_data: JSON.stringify(task)
          });
        });
      });

      if (taskInserts.length > 0) {
        const { error: insertError } = await supabase
          .from('tasks_data')
          .insert(taskInserts);

        if (insertError) {
          console.error('Erro ao salvar tarefas:', insertError);
          throw insertError;
        }
      }

      console.log('Tarefas salvas com sucesso:', taskInserts.length, 'itens');
    } catch (error) {
      console.error('Erro ao salvar tarefas:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user?.id) {
      console.log('Usuário logado, carregando dados:', user.id);
      loadTasksData();
    } else {
      console.log('Usuário não logado, limpando dados');
      setColumns([]);
      setLoading(false);
    }
  }, [user?.id]);

  const updateColumns = async (newColumns: TaskColumn[]) => {
    console.log('Atualizando colunas:', newColumns);
    setColumns(newColumns);
    
    try {
      await saveColumnsToDatabase(newColumns);
      await saveTasksToDatabase(newColumns);
      console.log('Dados atualizados com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      // Reverter mudanças em caso de erro
      await loadTasksData();
    }
  };

  const addColumn = async (title: string, color: string = 'bg-gray-100') => {
    if (!user?.id) {
      console.error('Usuário não logado');
      return;
    }

    const newColumn: TaskColumn = {
      id: `column-${Date.now()}`,
      title,
      color,
      tasks: [],
      order: columns.length
    };

    const newColumns = [...columns, newColumn];
    await updateColumns(newColumns);
  };

  const updateColumn = async (columnId: string, updates: Partial<TaskColumn>) => {
    const newColumns = columns.map(col => 
      col.id === columnId ? { ...col, ...updates } : col
    );
    await updateColumns(newColumns);
  };

  const deleteColumn = async (columnId: string) => {
    const newColumns = columns.filter(col => col.id !== columnId);
    await updateColumns(newColumns);
  };

  const addTask = async (columnId: string, task: Omit<Task, 'id'>) => {
    if (!user?.id) {
      console.error('Usuário não logado');
      return;
    }

    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    console.log('Adicionando nova tarefa:', newTask);

    const newColumns = columns.map(col => 
      col.id === columnId 
        ? { ...col, tasks: [...col.tasks, newTask] }
        : col
    );

    await updateColumns(newColumns);
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    console.log('Atualizando tarefa:', taskId, updates);
    
    const newColumns = columns.map(col => ({
      ...col,
      tasks: col.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    }));

    await updateColumns(newColumns);
  };

  const deleteTask = async (taskId: string) => {
    console.log('Deletando tarefa:', taskId);
    
    const newColumns = columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(task => task.id !== taskId)
    }));

    await updateColumns(newColumns);
  };

  const moveTask = async (taskId: string, fromColumnId: string, toColumnId: string, newIndex: number) => {
    console.log('Movendo tarefa:', taskId, 'de', fromColumnId, 'para', toColumnId);
    
    const newColumns = [...columns];
    
    // Encontrar a tarefa e removê-la da coluna atual
    let taskToMove: Task | null = null;
    const fromColumn = newColumns.find(col => col.id === fromColumnId);
    if (fromColumn) {
      const taskIndex = fromColumn.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        taskToMove = fromColumn.tasks.splice(taskIndex, 1)[0];
      }
    }

    // Adicionar a tarefa na nova coluna
    if (taskToMove) {
      const toColumn = newColumns.find(col => col.id === toColumnId);
      if (toColumn) {
        toColumn.tasks.splice(newIndex, 0, taskToMove);
      }
    }

    await updateColumns(newColumns);
  };

  return {
    columns,
    loading,
    updateColumns,
    addColumn,
    updateColumn,
    deleteColumn,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    refreshData: loadTasksData
  };
};
