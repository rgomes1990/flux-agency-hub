
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, TrendingUp, Pause, Play } from 'lucide-react';

export default function Campaigns() {
  // Mock data - será substituído por dados reais do Supabase
  const campaigns = [
    {
      id: '1',
      name: 'Campanha Google Ads - Produto X',
      type: 'google_ads',
      status: 'active',
      budget: 5000,
      spent: 2340,
      client: 'Empresa ABC',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      clicks: 1250,
      impressions: 45000,
      ctr: 2.78
    },
    {
      id: '2',
      name: 'Facebook Ads - Lançamento',
      type: 'facebook_ads',
      status: 'paused',
      budget: 3000,
      spent: 1800,
      client: 'Startup XYZ',
      startDate: '2024-01-20',
      endDate: '2024-02-20',
      clicks: 890,
      impressions: 32000,
      ctr: 2.78
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'google_ads': return '🔍';
      case 'facebook_ads': return '📘';
      case 'instagram_ads': return '📷';
      default: return '🎯';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campanhas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas campanhas de marketing digital</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 desde o mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.000</div>
            <p className="text-xs text-muted-foreground">+12% desde o mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 28.450</div>
            <p className="text-xs text-muted-foreground">63% do budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR Médio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.78%</div>
            <p className="text-xs text-muted-foreground">+0.3% desde o mês passado</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Campanhas */}
      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
                  <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <CardDescription>Cliente: {campaign.client}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status === 'active' ? 'Ativa' : 
                     campaign.status === 'paused' ? 'Pausada' : 'Finalizada'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    {campaign.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-semibold">R$ {campaign.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gasto</p>
                  <p className="font-semibold">R$ {campaign.spent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cliques</p>
                  <p className="font-semibold">{campaign.clicks.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CTR</p>
                  <p className="font-semibold">{campaign.ctr}%</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Progresso do Budget</span>
                  <span>{Math.round((campaign.spent / campaign.budget) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
