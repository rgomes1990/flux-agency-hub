
import React from 'react';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { RecentProjects } from '@/components/Dashboard/RecentProjects';
import { TaskSummary } from '@/components/Dashboard/TaskSummary';
import { ServiceTable } from '@/components/ServiceManagement/ServiceTable';
import { Users, FolderOpen, Target, CheckSquare } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Clientes"
          value="24"
          icon={Users}
          change={{ value: 12, trend: 'up' }}
          color="blue"
        />
        <StatsCard
          title="Projetos Ativos"
          value="8"
          icon={FolderOpen}
          change={{ value: 3, trend: 'up' }}
          color="green"
        />
        <StatsCard
          title="Campanhas"
          value="12"
          icon={Target}
          change={{ value: 8, trend: 'up' }}
          color="yellow"
        />
        <StatsCard
          title="Tarefas Pendentes"
          value="15"
          icon={CheckSquare}
          change={{ value: 2, trend: 'down' }}
          color="red"
        />
      </div>

      {/* Service Management Table */}
      <ServiceTable />

      {/* Recent Projects and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentProjects />
        <TaskSummary />
      </div>
    </div>
  );
}
