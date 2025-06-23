
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignedTo: string;
  client: string;
  project: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  attachments?: Array<{
    name: string;
    size: number;
    type: string;
    data: string;
  }>;
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

export const useTasksData = () => {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'A Fazer',
      color: 'bg-gray-100',
      tasks: []
    },
    {
      id: 'in_progress',
      title: 'Em Andamento',
      color: 'bg-blue-100',
      tasks: []
    },
    {
      id: 'review',
      title: 'Em Revisão',
      color: 'bg-yellow-100',
      tasks: []
    },
    {
      id: 'done',
      title: 'Concluído',
      color: 'bg-green-100',
      tasks: []
    }
  ]);

  const { user, logAudit } = useAuth();

  const loadTasksData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks_data')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar tarefas:', error);
        return;
      }

      if (data && data.length > 0) {
        const columnsMap = new Map<string, Column>();
        
        // Inicializar colunas padrão
        columns.forEach(col => {
          columnsMap.set(col.id, { ...col, tasks: [] });
        });

        // Adicionar tarefas às colunas
        data.forEach(item => {
          const taskData = typeof item.task_data === 'string' ? JSON.parse(item.task_data) : item.task_data;
          
          if (!columnsMap.has(item.column_id)) {
            columnsMap.set(item.column_id, {
              id: item.column_id,
              title: item.column_title,
              color: item.column_color,
              tasks: []
            });
          }

          const column = columnsMap.get(item.column_id)!;
          column.tasks.push(taskData);
        });

        setColumns(Array.from(columnsMap.values()));
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };

  useEffect(() => {
    loadTasksData();
  }, [user]);

  const saveTasksToDatabase = async (newColumns: Column[]) => {
    if (!user) return;

    try {
      // Limpar dados existentes
      await supabase
        .from('tasks_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Inserir novos dados
      const insertData = [];
      for (const column of newColumns) {
        for (const task of column.tasks) {
          insertData.push({
            user_id: user.id,
            column_id: column.id,
            column_title: column.title,
            column_color: column.color,
            task_data: JSON.stringify(task)
          });
        }
      }

      if (insertData.length > 0) {
        const { error } = await supabase
          .from('tasks_data')
          .insert(insertData);

        if (error) {
          console.error('Erro ao salvar tarefas:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar tarefas:', error);
    }
  };

  const updateColumns = (newColumns: Column[]) => {
    setColumns(newColumns);
    saveTasksToDatabase(newColumns);
  };

  const updateTaskTitle = (taskId: string, newTitle: string) => {
    const newColumns = columns.map(col => ({
      ...col,
      tasks: col.tasks.map(task => 
        task.id === taskId ? { ...task, title: newTitle } : task
      )
    }));
    setColumns(newColumns);
    saveTasksToDatabase(newColumns);
  };

  const createTask = (columnId: string, taskData: Partial<Task>, position?: number) => {
    // Converter File[] para formato serializable
    const processedAttachments = taskData.attachments?.map(file => {
      if (file instanceof File) {
        return new Promise<{name: string, size: number, type: string, data: string}>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              name: file.name,
              size: file.size,
              type: file.type,
              data: reader.result as string
            });
          };
          reader.readAsDataURL(file);
        });
      }
      return Promise.resolve(file);
    });

    if (processedAttachments) {
      Promise.all(processedAttachments).then(attachments => {
        const newTask: Task = {
          id: `task-${Date.now()}`,
          title: taskData.title || 'Nova Tarefa',
          description: taskData.description || 'Descrição da tarefa',
          type: taskData.type || 'general',
          priority: taskData.priority || 'medium',
          assignedTo: taskData.assignedTo || 'Usuário',
          client: taskData.client || 'Cliente',
          project: taskData.project || 'Projeto',
          dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
          estimatedHours: taskData.estimatedHours || 4,
          actualHours: taskData.actualHours || 0,
          attachments: attachments
        };

        const newColumns = columns.map(col => {
          if (col.id === columnId) {
            const newTasks = [...col.tasks];
            if (position !== undefined && position >= 0 && position <= newTasks.length) {
              newTasks.splice(position, 0, newTask);
            } else {
              newTasks.push(newTask);
            }
            return { ...col, tasks: newTasks };
          }
          return col;
        });

        setColumns(newColumns);
        saveTasksToDatabase(newColumns);
      });
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title || 'Nova Tarefa',
        description: taskData.description || 'Descrição da tarefa',
        type: taskData.type || 'general',
        priority: taskData.priority || 'medium',
        assignedTo: taskData.assignedTo || 'Usuário',
        client: taskData.client || 'Cliente',
        project: taskData.project || 'Projeto',
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
        estimatedHours: taskData.estimatedHours || 4,
        actualHours: taskData.actualHours || 0,
        attachments: []
      };

      const newColumns = columns.map(col => {
        if (col.id === columnId) {
          const newTasks = [...col.tasks];
          if (position !== undefined && position >= 0 && position <= newTasks.length) {
            newTasks.splice(position, 0, newTask);
          } else {
            newTasks.push(newTask);
          }
          return { ...col, tasks: newTasks };
        }
        return col;
      });

      setColumns(newColumns);
      saveTasksToDatabase(newColumns);
    }

    return `task-${Date.now()}`;
  };

  const deleteTask = (taskId: string) => {
    const newColumns = columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(task => task.id !== taskId)
    }));
    setColumns(newColumns);
    saveTasksToDatabase(newColumns);
  };

  const addColumn = (columnName: string, color: string = 'bg-gray-100') => {
    const newColumn: Column = {
      id: `column-${Date.now()}`,
      title: columnName,
      color: color,
      tasks: []
    };
    
    const newColumns = [...columns, newColumn];
    setColumns(newColumns);
    saveTasksToDatabase(newColumns);
  };

  const deleteColumn = (columnId: string) => {
    const newColumns = columns.filter(col => col.id !== columnId);
    setColumns(newColumns);
    saveTasksToDatabase(newColumns);
  };

  const editColumn = (columnId: string, newTitle: string) => {
    const newColumns = columns.map(col => 
      col.id === columnId ? { ...col, title: newTitle } : col
    );
    setColumns(newColumns);
    saveTasksToDatabase(newColumns);
  };

  const updateColumnColor = (columnId: string, color: string) => {
    const newColumns = columns.map(col => 
      col.id === columnId ? { ...col, color: color } : col
    );
    setColumns(newColumns);
    saveTasksToDatabase(newColumns);
  };

  return {
    columns,
    updateColumns,
    updateTaskTitle,
    createTask,
    deleteTask,
    addColumn,
    deleteColumn,
    editColumn,
    updateColumnColor
  };
};
