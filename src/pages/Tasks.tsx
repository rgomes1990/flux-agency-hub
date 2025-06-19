
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckSquare, Clock, AlertTriangle, User } from 'lucide-react';

export default function Tasks() {
  // Mock data - será substituído por dados reais do Supabase
  const tasks = [
    {
      id: '1',
      title: 'Criar design da landing page',
      description: 'Desenvolver wireframe e mockup da nova landing page',
      type: 'design',
      status: 'in_progress',
      priority: 'high',
      assignedTo: 'João Design',
      client: 'Empresa ABC',
      project: 'Website Institucional',
      dueDate: '2024-01-20',
      estimatedHours: 8,
      actualHours: 5
    },
    {
      id: '2',
      title: 'Revisar conteúdo do blog',
      description: 'Revisar e aprovar 3 artigos do blog corporativo',
      type: 'content',
      status: 'todo',
      priority: 'medium',
      assignedTo: 'Maria Redatora',
      client: 'Startup XYZ',
      project: 'Marketing de Conteúdo',
      dueDate: '2024-01-22',
      estimatedHours: 4,
      actualHours: 0
    },
    {
      id: '3',
      title: 'Implementar sistema de pagamento',
      description: 'Integrar gateway de pagamento no e-commerce',
      type: 'development',
      status: 'review',
      priority: 'urgent',
      assignedTo: 'Pedro Dev',
      client: 'E-commerce ABC',
      project: 'Loja Virtual',
      dueDate: '2024-01-18',
      estimatedHours: 16,
      actualHours: 14
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo': return 'A Fazer';
      case 'in_progress': return 'Em Andamento';
      case 'review': return 'Em Revisão';
      case 'completed': return 'Concluída';
      default: return status;
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600 mt-1">Gerencie todas as tarefas da sua agência</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">+5 esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">38% do total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground text-red-600">Requer atenção</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">26</div>
            <p className="text-xs text-muted-foreground">55% do total</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Tarefas */}
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(task.type)}</span>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {task.description}
                    </CardDescription>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Cliente: {task.client}</span>
                      <span>Projeto: {task.project}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(task.priority)}>
                    {getPriorityText(task.priority)}
                  </Badge>
                  <Badge className={getStatusColor(task.status)}>
                    {getStatusText(task.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Responsável</p>
                    <p className="font-semibold">{task.assignedTo}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prazo</p>
                  <p className="font-semibold">
                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tempo Estimado</p>
                  <p className="font-semibold">{task.estimatedHours}h</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tempo Gasto</p>
                  <p className="font-semibold">{task.actualHours}h</p>
                </div>
              </div>
              
              {task.estimatedHours > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Progresso</span>
                    <span>{Math.round((task.actualHours / task.estimatedHours) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((task.actualHours / task.estimatedHours) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
