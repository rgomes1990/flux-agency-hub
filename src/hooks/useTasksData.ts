
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
        },
        {
          id: '2',
          title: 'Revisar conteúdo do blog',
          description: 'Revisar e aprovar 3 artigos do blog corporativo',
          type: 'content',
          priority: 'medium',
          assignedTo: 'Maria Redatora',
          client: 'Startup XYZ',
          project: 'Marketing de Conteúdo',
          dueDate: '2024-01-22',
          estimatedHours: 4,
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
      tasks: [
        {
          id: '4',
          title: 'Implementar sistema de pagamento',
          description: 'Integrar gateway de pagamento no e-commerce',
          type: 'development',
          priority: 'urgent',
          assignedTo: 'Pedro Dev',
          client: 'E-commerce ABC',
          project: 'Loja Virtual',
          dueDate: '2024-01-18',
          estimatedHours: 16,
          actualHours: 14
        }
      ]
    },
    {
      id: 'done',
      title: 'Concluído',
      color: 'bg-green-100',
      tasks: [
        {
          id: '5',
          title: 'Campanha de redes sociais',
          description: 'Criar posts para Instagram e Facebook',
          type: 'marketing',
          priority: 'medium',
          assignedTo: 'Ana Social',
          client: 'Loja Fashion',
          project: 'Marketing Digital',
          dueDate: '2024-01-15',
          estimatedHours: 6,
          actualHours: 6
        }
      ]
    }
  ]);

  // Carregar dados do localStorage ao inicializar
  useEffect(() => {
    const savedData = localStorage.getItem('tasksData');
    if (savedData) {
      try {
        setColumns(JSON.parse(savedData));
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
      actualHours: taskData.actualHours || 0
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

  return {
    columns,
    updateColumns,
    updateTaskTitle,
    createTask
  };
};
