
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Project } from '@/types';

const mockProjects: Project[] = [
  {
    id: '1',
    clientId: '1',
    name: 'Site Institucional - Tech Corp',
    type: 'Site Institucional',
    status: 'Desenvolvimento',
    progress: 65,
    startDate: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
    assignedTo: 'João Silva',
    stages: []
  },
  {
    id: '2',
    clientId: '2',
    name: 'E-commerce - Fashion Store',
    type: 'E-commerce',
    status: 'Revisão',
    progress: 85,
    startDate: new Date('2024-01-10'),
    dueDate: new Date('2024-02-10'),
    assignedTo: 'Maria Santos',
    stages: []
  },
  {
    id: '3',
    clientId: '3',
    name: 'Landing Page - Curso Online',
    type: 'Landing Page',
    status: 'Aprovação',
    progress: 95,
    startDate: new Date('2024-01-20'),
    dueDate: new Date('2024-01-30'),
    assignedTo: 'Pedro Costa',
    stages: []
  }
];

export function RecentProjects() {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projetos Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockProjects.map((project) => (
            <div key={project.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-slate-900">{project.name}</h4>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
                <span>{project.type}</span>
                <span>Responsável: {project.assignedTo}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
