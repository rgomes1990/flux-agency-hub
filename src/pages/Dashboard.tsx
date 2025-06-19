
import React from 'react';
import { Users, FolderOpen, Target, CheckSquare } from 'lucide-react';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { RecentProjects } from '@/components/Dashboard/RecentProjects';
import { TaskSummary } from '@/components/Dashboard/TaskSummary';

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Visão geral da sua agência de marketing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Clientes Ativos"
          value={24}
          icon={Users}
          change={{ value: 12, trend: 'up' }}
          color="blue"
        />
        <StatsCard
          title="Projetos em Andamento"
          value={18}
          icon={FolderOpen}
          change={{ value: 8, trend: 'up' }}
          color="green"
        />
        <StatsCard
          title="Campanhas Ativas"
          value={32}
          icon={Target}
          change={{ value: 5, trend: 'down' }}
          color="yellow"
        />
        <StatsCard
          title="Tarefas Pendentes"
          value={47}
          icon={CheckSquare}
          change={{ value: 15, trend: 'up' }}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentProjects />
        <TaskSummary />
      </div>
    </div>
  );
}
