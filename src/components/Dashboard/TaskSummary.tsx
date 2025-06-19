
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle } from 'lucide-react';

const mockTasks = [
  {
    id: '1',
    title: 'Criar layout homepage Tech Corp',
    type: 'Design',
    priority: 'Alta',
    assignedTo: 'Ana Designer',
    dueDate: '2024-01-25'
  },
  {
    id: '2',
    title: 'Redação de conteúdo blog Fashion',
    type: 'Redação',
    priority: 'Média',
    assignedTo: 'Carlos Redator',
    dueDate: '2024-01-26'
  },
  {
    id: '3',
    title: 'Configurar campanha Google Ads',
    type: 'Tráfego',
    priority: 'Urgente',
    assignedTo: 'Laura Tráfego',
    dueDate: '2024-01-24'
  }
];

export function TaskSummary() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Baixa': return 'bg-green-100 text-green-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Alta': return 'bg-orange-100 text-orange-800';
      case 'Urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarefas Urgentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockTasks.map((task) => (
            <div key={task.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-slate-900 text-sm">{task.title}</h4>
                {isOverdue(task.dueDate) && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {task.type}
                  </Badge>
                  <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </Badge>
                </div>
                <div className="flex items-center text-xs text-slate-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {task.dueDate}
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-1">{task.assignedTo}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
