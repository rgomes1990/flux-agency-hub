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
  const { user, logAudit } = useAuth();

  // Carregar colunas e tarefas do Supabase
  const loadTasksData = async () => {
    try {
      console.log('DEBUG: Carregando dados globais de tarefas');
      setLoading(true);

      // Carregar configurações de colunas globais
      const { data: columnData, error: columnError } = await supabase
        .from('task_columns')
        .select('*')
        .is('user_id', null) // Carregar apenas dados globais
        .order('column_order', { ascending: true });

      console.log('DEBUG: Resposta colunas:', { columnData, columnError });

      if (columnError) {
        console.error('DEBUG: Erro ao carregar colunas:', columnError);
        // Em caso de erro, usar colunas padrão
        const defaultColumns: TaskColumn[] = [
          { id: 'todo', title: 'A Fazer', color: 'bg-gray-100', tasks: [], order: 0 },
          { id: 'doing', title: 'Fazendo', color: 'bg-blue-100', tasks: [], order: 1 },
          { id: 'done', title: 'Feito', color: 'bg-green-100', tasks: [], order: 2 }
        ];
        setColumns(defaultColumns);
        setLoading(false);
        return;
      }

      // Carregar dados de tarefas globais
      const { data: taskData, error: taskError } = await supabase
        .from('tasks_data')
        .select('*')
        .is('user_id', null) // Carregar apenas dados globais
        .order('created_at', { ascending: true });

      console.log('DEBUG: Resposta tarefas:', { taskData, taskError });

      if (taskError) {
        console.error('DEBUG: Erro ao carregar tarefas:', taskError);
      }

      // Se não há configurações de colunas, criar padrões
      if (!columnData || columnData.length === 0) {
        console.log('DEBUG: Criando colunas padrão no banco...');
        const defaultColumns: TaskColumn[] = [
          { id: 'todo', title: 'A Fazer', color: 'bg-gray-100', tasks: [], order: 0 },
          { id: 'doing', title: 'Fazendo', color: 'bg-blue-100', tasks: [], order: 1 },
          { id: 'done', title: 'Feito', color: 'bg-green-100', tasks: [], order: 2 }
        ];
        
        // Salvar colunas padrão no banco
        try {
          await saveColumnsToDatabase(defaultColumns);
        } catch (error) {
          console.error('DEBUG: Erro ao salvar colunas padrão:', error);
        }
        
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
            console.error('DEBUG: Erro ao processar tarefa:', taskRow, error);
          }
        });
      }

      const finalColumns = Array.from(columnsMap.values()).sort((a, b) => a.order - b.order);
      console.log('DEBUG: Colunas finais carregadas:', finalColumns);
      setColumns(finalColumns);
    } catch (error) {
      console.error('DEBUG: Erro geral ao carregar dados:', error);
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
    try {
      console.log('DEBUG: Iniciando salvamento de colunas como dados globais');
      console.log('DEBUG: Colunas a salvar:', newColumns);

      // Deletar configurações antigas primeiro
      const { error: deleteError } = await supabase
        .from('task_columns')
        .delete()
        .eq('user_id', null); // Deletar dados globais

      if (deleteError) {
        console.error('DEBUG: Erro ao deletar colunas antigas:', deleteError);
        throw deleteError;
      }

      // Inserir novas configurações como dados globais
      const columnInserts = newColumns.map(col => ({
        user_id: null, // Sempre null para dados globais
        column_id: col.id,
        column_title: col.title,
        column_color: col.color,
        column_order: col.order
      }));

      console.log('DEBUG: Dados para inserir:', columnInserts);

      if (columnInserts.length > 0) {
        const { data: insertData, error: insertError } = await supabase
          .from('task_columns')
          .insert(columnInserts)
          .select();

        console.log('DEBUG: Resultado da inserção:', { insertData, insertError });

        if (insertError) {
          console.error('DEBUG: Erro ao inserir colunas:', insertError);
          throw insertError;
        }

        console.log('DEBUG: Colunas salvas como dados globais com sucesso');
        if (user?.id) {
          await logAudit('task_columns', user.id, 'UPDATE', null, columnInserts);
        }
      }
    } catch (error) {
      console.error('DEBUG: Erro no salvamento de colunas:', error);
      throw error;
    }
  };

  // Salvar tarefas no Supabase
  const saveTasksToDatabase = async (newColumns: TaskColumn[]) => {
    try {
      console.log('DEBUG: Iniciando salvamento de tarefas como dados globais');

      // Deletar tarefas antigas primeiro
      const { error: deleteError } = await supabase
        .from('tasks_data')
        .delete()
        .eq('user_id', null); // Deletar dados globais

      if (deleteError) {
        console.error('DEBUG: Erro ao deletar tarefas antigas:', deleteError);
        throw deleteError;
      }

      // Inserir novas tarefas como dados globais
      const taskInserts: any[] = [];
      newColumns.forEach(column => {
        column.tasks.forEach(task => {
          taskInserts.push({
            user_id: null, // Sempre null para dados globais
            column_id: column.id,
            column_title: column.title,
            column_color: column.color,
            task_data: JSON.stringify(task)
          });
        });
      });

      console.log('DEBUG: Tarefas para inserir:', taskInserts);

      if (taskInserts.length > 0) {
        const { data: insertData, error: insertError } = await supabase
          .from('tasks_data')
          .insert(taskInserts)
          .select();

        console.log('DEBUG: Resultado da inserção de tarefas:', { insertData, insertError });

        if (insertError) {
          console.error('DEBUG: Erro ao inserir tarefas:', insertError);
          throw insertError;
        }
      }

      console.log('DEBUG: Tarefas salvas como dados globais com sucesso:', taskInserts.length, 'itens');
      if (user?.id) {
        await logAudit('tasks_data', user.id, 'UPDATE', null, taskInserts);
      }
    } catch (error) {
      console.error('DEBUG: Erro no salvamento de tarefas:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadTasksData();
  }, []);

  const updateColumns = async (newColumns: TaskColumn[]) => {
    console.log('DEBUG: ====== INICIANDO ATUALIZAÇÃO DE COLUNAS ======');
    console.log('DEBUG: Usuário logado:', !!user?.id, user?.id);
    console.log('DEBUG: Colunas atuais:', columns.length);
    console.log('DEBUG: Novas colunas:', newColumns.length);
    
    // Primeiro, atualizar estado local
    setColumns(newColumns);
    
    try {
      console.log('DEBUG: Salvando colunas como dados globais...');
      await saveColumnsToDatabase(newColumns);
      
      console.log('DEBUG: Salvando tarefas como dados globais...');
      await saveTasksToDatabase(newColumns);
      
      console.log('DEBUG: ====== ATUALIZAÇÃO CONCLUÍDA COM SUCESSO ======');
    } catch (error) {
      console.error('DEBUG: ====== ERRO NA ATUALIZAÇÃO ======');
      console.error('DEBUG: Erro:', error);
      
      // Em caso de erro, recarregar dados do banco
      console.log('DEBUG: Recarregando dados devido ao erro...');
      await loadTasksData();
    }
  };

  const addColumn = async (title: string, color: string = 'bg-gray-100') => {
    console.log('DEBUG: ====== ADICIONANDO NOVA COLUNA ======');
    console.log('DEBUG: Título:', title, 'Cor:', color);
    
    const newColumn: TaskColumn = {
      id: `column-${Date.now()}`,
      title,
      color,
      tasks: [],
      order: columns.length
    };

    console.log('DEBUG: Nova coluna criada:', newColumn);
    const newColumns = [...columns, newColumn];
    console.log('DEBUG: Total de colunas após adição:', newColumns.length);
    
    await updateColumns(newColumns);
  };

  const updateColumn = async (columnId: string, updates: Partial<TaskColumn>) => {
    console.log('DEBUG: ====== ATUALIZANDO COLUNA ======');
    console.log('DEBUG: ID da coluna:', columnId);
    console.log('DEBUG: Atualizações:', updates);
    
    const newColumns = columns.map(col => 
      col.id === columnId ? { ...col, ...updates } : col
    );
    await updateColumns(newColumns);
  };

  const deleteColumn = async (columnId: string) => {
    console.log('DEBUG: ====== DELETANDO COLUNA ======');
    console.log('DEBUG: ID da coluna:', columnId);
    console.log('DEBUG: Colunas atuais:', columns.length);
    
    const newColumns = columns.filter(col => col.id !== columnId);
    console.log('DEBUG: Colunas após exclusão:', newColumns.length);
    
    await updateColumns(newColumns);
  };

  const addTask = async (columnId: string, task: Omit<Task, 'id'>) => {
    console.log('DEBUG: ====== ADICIONANDO NOVA TAREFA ======');
    console.log('DEBUG: Coluna ID:', columnId);
    console.log('DEBUG: Tarefa:', task);
    
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    console.log('DEBUG: Nova tarefa criada:', newTask);

    const newColumns = columns.map(col => 
      col.id === columnId 
        ? { ...col, tasks: [...col.tasks, newTask] }
        : col
    );

    console.log('DEBUG: Colunas após adição da tarefa:', newColumns.find(c => c.id === columnId)?.tasks.length);
    await updateColumns(newColumns);
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    console.log('DEBUG: ====== ATUALIZANDO TAREFA ======');
    console.log('DEBUG: ID da tarefa:', taskId);
    console.log('DEBUG: Atualizações:', updates);
    
    const newColumns = columns.map(col => ({
      ...col,
      tasks: col.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    }));

    await updateColumns(newColumns);
  };

  const deleteTask = async (taskId: string) => {
    console.log('DEBUG: ====== DELETANDO TAREFA ======');
    console.log('DEBUG: ID da tarefa:', taskId);
    
    const newColumns = columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(task => task.id !== taskId)
    }));

    await updateColumns(newColumns);
  };

  const moveTask = async (taskId: string, fromColumnId: string, toColumnId: string, newIndex: number) => {
    console.log('DEBUG: ====== MOVENDO TAREFA ======');
    console.log('DEBUG: ID da tarefa:', taskId);
    console.log('DEBUG: Coluna de origem:', fromColumnId);
    console.log('DEBUG: Coluna de destino:', toColumnId);
    console.log('DEBUG: Nova posição:', newIndex);
    
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
