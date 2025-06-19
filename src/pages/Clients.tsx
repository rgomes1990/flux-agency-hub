
import React, { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Client } from '@/types';

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Tech Corporation',
    email: 'contato@techcorp.com',
    phone: '(11) 99999-9999',
    company: 'Tech Corp Ltd.',
    type: 'Completo',
    status: 'Ativo',
    credits: 5000,
    lastContact: new Date('2024-01-20'),
    projects: [],
    campaigns: []
  },
  {
    id: '2',
    name: 'Fashion Store',
    email: 'marketing@fashionstore.com',
    phone: '(11) 88888-8888',
    company: 'Fashion Store S.A.',
    type: 'Meta',
    status: 'Ativo',
    credits: 2500,
    lastContact: new Date('2024-01-18'),
    projects: [],
    campaigns: []
  },
  {
    id: '3',
    name: 'Curso Online',
    email: 'contato@cursoonline.com',
    phone: '(11) 77777-7777',
    company: 'Educação Digital',
    type: 'Sites',
    status: 'Aguardando',
    credits: 0,
    lastContact: new Date('2024-01-15'),
    projects: [],
    campaigns: []
  }
];

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Inativo': return 'bg-red-100 text-red-800';
      case 'Aguardando': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Meta': return 'bg-blue-100 text-blue-800';
      case 'Google': return 'bg-green-100 text-green-800';
      case 'Sites': return 'bg-purple-100 text-purple-800';
      case 'Conteúdo': return 'bg-orange-100 text-orange-800';
      case 'Completo': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-600">Gerencie seus clientes e relacionamentos</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{client.name}</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(client.status)}>
                  {client.status}
                </Badge>
                <Badge className={getTypeColor(client.type)}>
                  {client.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{client.company}</p>
                <p className="text-sm text-slate-600">{client.email}</p>
                <p className="text-sm text-slate-600">{client.phone}</p>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  <p className="text-xs text-slate-600">Créditos</p>
                  <p className="text-sm font-medium text-slate-900">
                    R$ {client.credits.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Último contato</p>
                  <p className="text-sm font-medium text-slate-900">
                    {client.lastContact.toLocaleDateString()}
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
