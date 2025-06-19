
import React from 'react';
import { Plus, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const mockProjects = [
  {
    id: '1',
    name: 'Site Institucional - Tech Corp',
    client: 'Tech Corporation',
    type: 'Site Institucional',
    status: 'Desenvolvimento',
    progress: 65,
    dueDate: '2024-02-15',
    assignedTo: 'João Silva',
    stages: [
      { name: 'Briefing', status: 'Concluído' },
      { name: 'Wireframe', status: 'Concluído' },
      { name: 'Design', status: 'Em Andamento' },
      { name: 'Desenvolvimento', status: 'Pendente' },
      { name: 'Testes', status: 'Pendente' }
    ]
  },
  {
    id: '2',
    name: 'E-commerce - Fashion Store',
    client: 'Fashion Store',
    type: 'E-commerce',
    status: 'Revisão',
    progress: 85,
    dueDate: '2024-02-10',
    assignedTo: 'Maria Santos',
    stages: [
      { name: 'Briefing', status: 'Concluído' },
      { name: 'Wireframe', status: 'Concluído' },
      { name: 'Design', status: 'Concluído' },
      { name: 'Desenvolvimento', status: 'Concluído' },
      { name: 'Testes', status: 'Em Andamento' }
    ]
  }
];

export default function Projects() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planejamento': return 'bg-slate-100 text-slate-800';
      case 'Desenvolvimento': return 'bg-blue-100 text-blue-800';
      case 'Revisão': return 'bg-yellow-100 text-yellow-800';
      case 'Aprovação': return 'bg-orange-100 text-orange-800';
      case 'Finalizado': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case 'Concluído': return 'bg-green-100 text-green-800';
      case 'Em Andamento': return 'bg-blue-100 text-blue-800';
      case 'Pendente': return 'bg-slate-100 text-slate-800';
      case 'Parado': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projetos</h1>
          <p className="text-slate-600">Acompanhe o desenvolvimento dos seus projetos</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">{project.client}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {project.dueDate}
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {project.assignedTo}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Etapas</h4>
                <div className="space-y-1">
                  {project.stages.map((stage, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{stage.name}</span>
                      <Badge variant="outline" className={`text-xs ${getStageColor(stage.status)}`}>
                        {stage.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
