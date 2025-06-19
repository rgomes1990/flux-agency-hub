
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, BarChart3, TrendingUp, Download, Eye } from 'lucide-react';

export default function Reports() {
  // Mock data - será substituído por dados reais do Supabase
  const reports = [
    {
      id: '1',
      name: 'Relatório Mensal - Janeiro 2024',
      type: 'monthly_summary',
      client: 'Empresa ABC',
      generatedAt: '2024-01-31',
      period: 'Janeiro 2024',
      status: 'completed',
      metrics: {
        projects: 5,
        tasks: 23,
        hours: 145,
        revenue: 15000
      }
    },
    {
      id: '2',
      name: 'Performance de Campanhas - Q1',
      type: 'campaign_performance',
      client: 'Startup XYZ',
      generatedAt: '2024-01-15',
      period: 'Q1 2024',
      status: 'completed',
      metrics: {
        campaigns: 8,
        clicks: 12500,
        impressions: 450000,
        conversion: 3.2
      }
    },
    {
      id: '3',
      name: 'Progresso de Projetos',
      type: 'project_progress',
      client: 'E-commerce ABC',
      generatedAt: '2024-01-20',
      period: 'Janeiro 2024',
      status: 'completed',
      metrics: {
        projects: 3,
        completed: 1,
        inProgress: 2,
        delayed: 0
      }
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'monthly_summary': return 'bg-blue-100 text-blue-800';
      case 'campaign_performance': return 'bg-green-100 text-green-800';
      case 'project_progress': return 'bg-purple-100 text-purple-800';
      case 'financial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'monthly_summary': return '📊';
      case 'campaign_performance': return '🚀';
      case 'project_progress': return '📈';
      case 'financial': return '💰';
      default: return '📋';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'monthly_summary': return 'Resumo Mensal';
      case 'campaign_performance': return 'Performance de Campanhas';
      case 'project_progress': return 'Progresso de Projetos';
      case 'financial': return 'Financeiro';
      default: return type;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Analise o desempenho da sua agência</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Relatório
        </Button>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 125.600</div>
            <p className="text-xs text-muted-foreground">+12% desde o mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">+3 novos este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Trabalhadas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.245</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+5% desde o mês passado</p>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
          <CardDescription>Seus relatórios mais recentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(report.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{report.name}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>Cliente: {report.client}</span>
                        <span>Período: {report.period}</span>
                        <span>Gerado em: {new Date(report.generatedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(report.type)}>
                      {getTypeText(report.type)}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                </div>
                
                {/* Métricas do Relatório */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
                  {report.type === 'monthly_summary' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Projetos</p>
                        <p className="font-semibold">{report.metrics.projects}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tarefas</p>
                        <p className="font-semibold">{report.metrics.tasks}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Horas</p>
                        <p className="font-semibold">{report.metrics.hours}h</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Receita</p>
                        <p className="font-semibold">R$ {report.metrics.revenue?.toLocaleString()}</p>
                      </div>
                    </>
                  )}
                  {report.type === 'campaign_performance' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Campanhas</p>
                        <p className="font-semibold">{report.metrics.campaigns}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Cliques</p>
                        <p className="font-semibold">{report.metrics.clicks?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Impressões</p>
                        <p className="font-semibold">{report.metrics.impressions?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Conversão</p>
                        <p className="font-semibold">{report.metrics.conversion}%</p>
                      </div>
                    </>
                  )}
                  {report.type === 'project_progress' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-semibold">{report.metrics.projects}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Concluídos</p>
                        <p className="font-semibold">{report.metrics.completed}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Em Andamento</p>
                        <p className="font-semibold">{report.metrics.inProgress}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Atrasados</p>
                        <p className="font-semibold">{report.metrics.delayed}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
