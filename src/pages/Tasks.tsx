
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

export default function Tasks() {
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

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState('');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'design': return '🎨';
      case 'development': return '💻';
      case 'content': return '✍️';
      case 'marketing': return '📈';
      case 'meeting': return '👥';
      default: return '📋';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const createNewTask = () => {
    if (!newTaskTitle.trim() || !selectedColumn) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: 'Descrição da tarefa',
      type: 'general',
      priority: 'medium',
      assignedTo: 'Usuário',
      client: 'Cliente',
      project: 'Projeto',
      dueDate: new Date().toISOString().split('T')[0],
      estimatedHours: 4,
      actualHours: 0
    };

    setColumns(columns.map(col => 
      col.id === selectedColumn 
        ? { ...col, tasks: [...col.tasks, newTask] }
        : col
    ));

    setNewTaskTitle('');
    setSelectedColumn('');
    setShowNewTaskDialog(false);
  };

  return (
    <div className="p-6 h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas tarefas no estilo Kanban</p>
        </div>
        <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Título da tarefa"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <select 
                className="w-full p-2 border rounded-md"
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                <option value="">Selecione uma coluna</option>
                {columns.map(col => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
              <div className="flex space-x-2">
                <Button onClick={createNewTask} className="bg-orange-600 hover:bg-orange-700">
                  Criar
                </Button>
                <Button variant="outline" onClick={() => setShowNewTaskDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col">
            <div className={`${column.color} rounded-t-lg p-3 border-b-2 border-gray-200`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">{column.title}</h3>
                <Badge variant="secondary" className="bg-white text-gray-700">
                  {column.tasks.length}
                </Badge>
              </div>
            </div>
            
            <div className="flex-1 bg-white rounded-b-lg p-3 space-y-3 overflow-y-auto shadow-sm border border-gray-200">
              {column.tasks.map((task) => (
                <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{getTypeIcon(task.type)}</span>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 mb-3">{task.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={getPriorityColor(task.priority)}>
                          {getPriorityText(task.priority)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{task.assignedTo}</span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <div>Cliente: {task.client}</div>
                        <div>Projeto: {task.project}</div>
                      </div>
                      
                      {task.estimatedHours > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progresso</span>
                            <span>{Math.round((task.actualHours / task.estimatedHours) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-orange-500 h-1.5 rounded-full" 
                              style={{ width: `${Math.min((task.actualHours / task.estimatedHours) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
