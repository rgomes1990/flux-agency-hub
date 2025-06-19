
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Calendar, Eye, Edit } from 'lucide-react';

export default function Content() {
  // Mock data - será substituído por dados reais do Supabase
  const content = [
    {
      id: '1',
      title: 'Post sobre lançamento do produto X',
      type: 'social_media',
      status: 'published',
      platform: 'Instagram',
      client: 'Empresa ABC',
      publishedDate: '2024-01-15',
      scheduledDate: null,
      author: 'João Silva'
    },
    {
      id: '2',
      title: 'Blog post: Como aumentar vendas online',
      type: 'blog_post',
      status: 'draft',
      platform: 'Website',
      client: 'Startup XYZ',
      publishedDate: null,
      scheduledDate: '2024-01-20',
      author: 'Maria Santos'
    },
    {
      id: '3',
      title: 'Email marketing - Promoção de verão',
      type: 'email',
      status: 'review',
      platform: 'Email',
      client: 'E-commerce ABC',
      publishedDate: null,
      scheduledDate: '2024-01-25',
      author: 'Pedro Costa'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog_post': return '📝';
      case 'social_media': return '📱';
      case 'email': return '📧';
      case 'landing_page': return '🌐';
      case 'ad_copy': return '📢';
      default: return '📄';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Rascunho';
      case 'review': return 'Em Revisão';
      case 'approved': return 'Aprovado';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conteúdo</h1>
          <p className="text-gray-600 mt-1">Gerencie todo o conteúdo dos seus clientes</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Conteúdo
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Conteúdos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+12 este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publicados</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">57% do total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Revisão</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">44</div>
            <p className="text-xs text-muted-foreground">Para os próximos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Conteúdo */}
      <div className="grid gap-4">
        {content.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(item.type)}</span>
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>
                      Cliente: {item.client} • Autor: {item.author}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(item.status)}>
                    {getStatusText(item.status)}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="font-semibold capitalize">{item.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plataforma</p>
                  <p className="font-semibold">{item.platform}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data de Publicação</p>
                  <p className="font-semibold">
                    {item.publishedDate ? new Date(item.publishedDate).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Agendado para</p>
                  <p className="font-semibold">
                    {item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
