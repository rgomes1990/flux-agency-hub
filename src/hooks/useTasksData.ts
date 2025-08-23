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

      // Adicionar tarefas às colunas - COM PROTEÇÃO CONTRA DUPLICAÇÃO
      const processedTasks = new Set<string>();
      if (taskData && taskData.length > 0) {
        taskData.forEach(taskRow => {
          // Evitar processamento de tarefas duplicadas
          if (processedTasks.has(taskRow.id)) {
            console.warn('⚠️ TASKS: Tarefa duplicada detectada e ignorada:', taskRow.id);
            return;
          }
          processedTasks.add(taskRow.id);

          try {
            const taskInfo = typeof taskRow.task_data === 'string' 
              ? JSON.parse(taskRow.task_data) 
              : taskRow.task_data;
            
            const column = columnsMap.get(taskRow.column_id);
            if (column && taskInfo) {
              // Verificar se a tarefa já existe na coluna
              const existingTaskIndex = column.tasks.findIndex(existingTask => existingTask.id === taskInfo.id);
              if (existingTaskIndex === -1) {
                column.tasks.push(taskInfo);
              } else {
                console.warn('⚠️ TASKS: Tarefa já existe na coluna, atualizando:', taskInfo.id);
                column.tasks[existingTaskIndex] = taskInfo;
              }
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

  // Salvar tarefas no Supabase de forma segura - COM PROTEÇÃO CONTRA DUPLICAÇÃO
  const saveTasksToDatabase = async (newColumns: TaskColumn[]) => {
    try {
      console.log('DEBUG: Iniciando salvamento de tarefas como dados globais');

      // PRIMEIRO: Deletar TODAS as tarefas existentes para evitar duplicação
      const { error: deleteError } = await supabase
        .from('tasks_data')
        .delete()
        .is('user_id', null);

      if (deleteError) {
        console.error('DEBUG: Erro ao limpar tarefas antigas:', deleteError);
        throw deleteError;
      }

      // SEGUNDO: Inserir novas tarefas como dados globais
      const taskInserts: any[] = [];
      newColumns.forEach(column => {
        column.tasks.forEach(task => {
          // Garantir que cada tarefa tenha um ID único
          const taskId = task.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          taskInserts.push({
            user_id: null, // Sempre null para dados globais
            column_id: column.id,
            column_title: column.title,
            column_color: column.color,
            task_data: JSON.stringify({
              ...task,
              id: taskId // Garantir ID único
            })
          });
        });
      });

      console.log('DEBUG: Tarefas para inserir:', taskInserts.length);

      // Inserir as novas tarefas apenas se houver dados
      if (taskInserts.length > 0) {
        const { error: insertError } = await supabase
          .from('tasks_data')
          .insert(taskInserts);

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

  // Salvar configurações de colunas no Supabase de forma segura
  const saveColumnsToDatabase = async (newColumns: TaskColumn[]) => {
    try {
      console.log('DEBUG: Iniciando salvamento de colunas como dados globais');
      console.log('DEBUG: Colunas a salvar:', newColumns);

      // Inserir novas configurações como dados globais
      const columnInserts = newColumns.map(col => ({
        user_id: null, // Sempre null para dados globais
        column_id: col.id,
        column_title: col.title,
        column_color: col.color,
        column_order: col.order
      }));

      console.log('DEBUG: Dados para inserir:', columnInserts);

      // PRIMEIRO inserir as novas colunas
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

        // SÓ DEPOIS deletar as colunas antigas (exceto as recém inseridas)
        const newColumnIds = insertData?.map(col => col.id) || [];
        if (newColumnIds.length > 0) {
          const { error: deleteError } = await supabase
            .from('task_columns')
            .delete()
            .is('user_id', null)
            .not('id', 'in', `(${newColumnIds.map(id => `'${id}'`).join(',')})`);

          if (deleteError) {
            console.error('DEBUG: Erro ao deletar colunas antigas:', deleteError);
            // Não fazer throw aqui pois as novas colunas já foram salvas
          }
        }

        console.log('DEBUG: Colunas salvas como dados globais com sucesso');
        if (user?.id) {
          await logAudit('task_columns', user.id, 'UPDATE', null, columnInserts);
        }
      } else {
        // Se não há colunas para inserir, deletar todas as existentes
        const { error: deleteError } = await supabase
          .from('task_columns')
          .delete()
          .is('user_id', null);

        if (deleteError) {
          console.error('DEBUG: Erro ao deletar todas as colunas:', deleteError);
          throw deleteError;
        }
      }
    } catch (error) {
      console.error('DEBUG: Erro no salvamento de colunas:', error);
      throw error;
    }
  };

  const initializeDefaultColumns = async () => {
    try {
      console.log('DEBUG: Inicializando colunas padrão...');
      
      // Primeiro, limpar dados corrompidos das colunas e tarefas
      const { error: deleteColumnsError } = await supabase
        .from('task_columns')
        .delete()
        .not('user_id', 'is', null);

      const { error: deleteTasksError } = await supabase
        .from('tasks_data')
        .delete()
        .not('user_id', 'is', null);

      if (deleteColumnsError) {
        console.error('DEBUG: Erro ao limpar colunas corrompidas:', deleteColumnsError);
      }
      
      if (deleteTasksError) {
        console.error('DEBUG: Erro ao limpar tarefas corrompidas:', deleteTasksError);
      }

      // Verificar se já existem colunas padrão
      const { data: existingColumns } = await supabase
        .from('task_columns')
        .select('*')
        .is('user_id', null);

      if (!existingColumns || existingColumns.length === 0) {
        // Inserir colunas padrão
        const defaultColumns = [
          { user_id: null, column_id: 'todo', column_title: 'A Fazer', column_color: 'bg-gray-100', column_order: 0 },
          { user_id: null, column_id: 'doing', column_title: 'Fazendo', column_color: 'bg-blue-100', column_order: 1 },
          { user_id: null, column_id: 'done', column_title: 'Feito', column_color: 'bg-green-100', column_order: 2 }
        ];

        const { error: insertError } = await supabase
          .from('task_columns')
          .insert(defaultColumns);

        if (insertError) {
          console.error('DEBUG: Erro ao inserir colunas padrão:', insertError);
        } else {
          console.log('DEBUG: Colunas padrão inseridas com sucesso');
        }
      } else {
        console.log('DEBUG: Colunas padrão já existem:', existingColumns.length);
      }
    } catch (error) {
      console.error('DEBUG: Erro ao inicializar colunas:', error);
    }
  };

  useEffect(() => {
    initializeDefaultColumns().then(() => {
      loadTasksData();
    });
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

  const reorderColumn = async (columnId: string, direction: 'up' | 'down') => {
    console.log('DEBUG: ====== REORDENANDO COLUNA ======');
    console.log('DEBUG: ID da coluna:', columnId, 'Direção:', direction);
    
    const currentIndex = columns.findIndex(col => col.id === columnId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Verificar se o movimento é válido
    if (newIndex < 0 || newIndex >= columns.length) return;
    
    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(currentIndex, 1);
    newColumns.splice(newIndex, 0, movedColumn);
    
    // Atualizar a propriedade order
    newColumns.forEach((col, index) => {
      col.order = index;
    });
    
    console.log('DEBUG: Nova ordem das colunas:', newColumns.map(c => c.title));
    await updateColumns(newColumns);
  };

  const addTask = async (columnId: string, task: Omit<Task, 'id'>) => {
    console.log('DEBUG: ====== ADICIONANDO NOVA TAREFA ======');
    console.log('DEBUG: Coluna ID:', columnId);
    console.log('DEBUG: Tarefa:', task);
    
    // Gerar ID único com timestamp para evitar duplicação
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    console.log('DEBUG: Nova tarefa criada:', newTask);

    const newColumns = columns.map(col => {
      if (col.id === columnId) {
        // Verificar se a tarefa já existe antes de adicionar
        const taskExists = col.tasks.some(existingTask => existingTask.id === newTask.id);
        if (!taskExists) {
          return { ...col, tasks: [...col.tasks, newTask] };
        } else {
          console.warn('⚠️ TASKS: Tentativa de adicionar tarefa duplicada bloqueada:', newTask.id);
          return col;
        }
      }
      return col;
    });

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

  const reorderTask = async (taskId: string, columnId: string, direction: 'up' | 'down') => {
    console.log('DEBUG: ====== REORDENANDO TAREFA ======');
    console.log('DEBUG: ID da tarefa:', taskId, 'Direção:', direction);
    
    const column = columns.find(col => col.id === columnId);
    if (!column) return;
    
    const currentIndex = column.tasks.findIndex(task => task.id === taskId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Verificar se o movimento é válido
    if (newIndex < 0 || newIndex >= column.tasks.length) return;
    
    const newColumns = columns.map(col => {
      if (col.id !== columnId) return col;
      
      const newTasks = [...col.tasks];
      const [movedTask] = newTasks.splice(currentIndex, 1);
      newTasks.splice(newIndex, 0, movedTask);
      
      return { ...col, tasks: newTasks };
    });
    
    console.log('DEBUG: Tarefas reordenadas na coluna:', newColumns.find(c => c.id === columnId)?.tasks.map(t => t.title));
    await updateColumns(newColumns);
  };

  return {
    columns,
    loading,
    updateColumns,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumn,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTask,
    refreshData: loadTasksData
  };
};
