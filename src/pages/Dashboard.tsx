
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTasksData } from '@/hooks/useTasksData';
import { CheckSquare, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { columns } = useTasksData();
  
  const getTaskStats = () => {
    const stats = {
      total: 0,
      todo: 0,
      inProgress: 0,
      review: 0,
      done: 0
    };
    
    columns.forEach(column => {
      stats.total += column.tasks.length;
      
      switch (column.id) {
        case 'todo':
          stats.todo = column.tasks.length;
          break;
        case 'in_progress':
          stats.inProgress = column.tasks.length;
          break;
        case 'review':
          stats.review = column.tasks.length;
          break;
        case 'done':
          stats.done = column.tasks.length;
          break;
      }
    });
    
    return stats;
  };
  
  const stats = getTaskStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral das suas tarefas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Tarefas
              </CardTitle>
              <CheckSquare className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                A Fazer
              </CardTitle>
              <Clock className="h-5 w-5 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.todo}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Em Andamento
              </CardTitle>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Concluídas
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.done}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {columns.map((column) => (
                <div key={column.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{column.title}</span>
                  <span className="text-sm text-gray-600">{column.tasks.length} tarefas</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Taxa de Conclusão</span>
                <span className="text-sm text-gray-600">
                  {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Em Progresso</span>
                <span className="text-sm text-gray-600">
                  {stats.total > 0 ? Math.round(((stats.inProgress + stats.review) / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
