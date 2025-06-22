
import { useState, useEffect } from 'react';

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
  attachments?: File[];
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
      tasks: [
        {
          id: '1',
          title: 'Criar design da landing page',
          description: 'Desenvolver wireframe e mockup da nova landing page',
          type: 'design',
          priority: 'high',
          assignedTo: 'João Design',
          client: 'Empresa ABC',
          project: 'Website Institucional',
          dueDate: '2024-01-20',
          estimatedHours: 8,
          actualHours: 0
        }
      ]
    },
    {
      id: 'in_progress',
      title: 'Em Andamento',
      color: 'bg-blue-100',
      tasks: [
        {
          id: '3',
          title: 'Desenvolvimento do sistema',
          description: 'Criar módulo de autenticação',
          type: 'development',
          priority: 'high',
          assignedTo: 'Carlos Dev',
          client: 'Tech Corp',
          project: 'Sistema CRM',
          dueDate: '2024-01-25',
          estimatedHours: 16,
          actualHours: 8
        }
      ]
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

  // Carregar dados do localStorage ao inicializar
  useEffect(() => {
    const savedData = localStorage.getItem('tasksData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setColumns(parsedData);
      } catch (error) {
        console.error('Erro ao carregar dados das tarefas:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que columns mudar
  useEffect(() => {
    localStorage.setItem('tasksData', JSON.stringify(columns));
  }, [columns]);

  const updateColumns = (newColumns: Column[]) => {
    setColumns(newColumns);
  };

  const updateTaskTitle = (taskId: string, newTitle: string) => {
    setColumns(columns.map(col => ({
      ...col,
      tasks: col.tasks.map(task => 
        task.id === taskId ? { ...task, title: newTitle } : task
      )
    })));
  };

  const createTask = (columnId: string, taskData: Partial<Task>, position?: number) => {
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
      attachments: taskData.attachments
    };

    setColumns(columns.map(col => {
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
    }));

    return newTask.id;
  };

  const deleteTask = (taskId: string) => {
    setColumns(columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(task => task.id !== taskId)
    })));
  };

  const addColumn = (columnName: string, color: string = 'bg-gray-100') => {
    const newColumn: Column = {
      id: `column-${Date.now()}`,
      title: columnName,
      color: color,
      tasks: []
    };
    
    setColumns(prev => [...prev, newColumn]);
  };

  const deleteColumn = (columnId: string) => {
    setColumns(prev => prev.filter(col => col.id !== columnId));
  };

  const editColumn = (columnId: string, newTitle: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, title: newTitle } : col
    ));
  };

  const updateColumnColor = (columnId: string, color: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, color: color } : col
    ));
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
