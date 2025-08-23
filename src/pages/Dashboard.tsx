import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTasksData } from '@/hooks/useTasksData';
import { useContentData } from '@/hooks/useContentData';
import { useContentPadariasData } from '@/hooks/useContentPadariasData';
import { useTrafficData } from '@/hooks/useTrafficData';
import { useGoogleMyBusinessData } from '@/hooks/useGoogleMyBusinessData';
import useRSGAvaliacoesData from '@/hooks/useRSGAvaliacoesData';
import { useVideosData } from '@/hooks/useVideosData';
import { useSitesData } from '@/hooks/useSitesData';
import { CheckSquare, Clock, AlertCircle, CheckCircle, Users, FileText, Building, Star, Video, Globe } from 'lucide-react';
import { StatsCard } from '@/components/Dashboard/StatsCard';

export default function Dashboard() {
  const { columns } = useTasksData();
  const { groups: contentGroups } = useContentData();
  const { groups: padariasGroups } = useContentPadariasData();
  const { groups: trafficGroups } = useTrafficData();
  const { groups: gmbGroups } = useGoogleMyBusinessData();
  const { groups: rsgGroups } = useRSGAvaliacoesData();
  const { groups: videoGroups } = useVideosData();
  const { groups: sitesGroups } = useSitesData();
  
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

  const getClientCounts = () => {
    return {
      content: contentGroups.reduce((total, group) => total + group.items.length, 0),
      padarias: padariasGroups.reduce((total, group) => total + group.items.length, 0),
      traffic: trafficGroups.reduce((total, group) => total + group.items.length, 0),
      gmb: gmbGroups.reduce((total, group) => total + group.items.length, 0),
      rsg: rsgGroups.reduce((total, group) => total + group.items.length, 0),
      videos: videoGroups.reduce((total, group) => total + group.items.length, 0),
      sites: sitesGroups.reduce((total, group) => total + group.items.length, 0)
    };
  };
  
  const stats = getTaskStats();
  const clientCounts = getClientCounts();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral das suas tarefas e clientes</p>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Tarefas"
          value={stats.total}
          icon={CheckSquare}
          color="blue"
        />
        <StatsCard
          title="A Fazer"
          value={stats.todo}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Em Andamento"
          value={stats.inProgress}
          icon={AlertCircle}
          color="blue"
        />
        <StatsCard
          title="Concluídas"
          value={stats.done}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Client Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Clientes por Módulo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Conteúdo"
            value={clientCounts.content}
            icon={FileText}
            color="blue"
          />
          <StatsCard
            title="Conteúdo Padarias"
            value={clientCounts.padarias}
            icon={Building}
            color="green"
          />
          <StatsCard
            title="Tráfego Pago"
            value={clientCounts.traffic}
            icon={Users}
            color="red"
          />
          <StatsCard
            title="Google My Business"
            value={clientCounts.gmb}
            icon={Building}
            color="yellow"
          />
          <StatsCard
            title="RSG Avaliações"
            value={clientCounts.rsg}
            icon={Star}
            color="blue"
          />
          <StatsCard
            title="Vídeos"
            value={clientCounts.videos}
            icon={Video}
            color="green"
          />
          <StatsCard
            title="Criação de Sites"
            value={clientCounts.sites}
            icon={Globe}
            color="red"
          />
        </div>
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
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total de Clientes</span>
                <span className="text-sm text-gray-600">
                  {Object.values(clientCounts).reduce((total, count) => total + count, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
