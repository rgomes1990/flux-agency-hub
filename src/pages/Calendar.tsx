
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar as CalendarIcon, Clock, Users } from 'lucide-react';

export default function Calendar() {
  // Mock data - será substituído por dados reais do Supabase
  const events = [
    {
      id: '1',
      title: 'Reunião com Cliente ABC',
      type: 'meeting',
      date: '2024-01-20',
      time: '14:00',
      duration: 60,
      client: 'Empresa ABC',
      attendees: ['João Silva', 'Maria Santos'],
      description: 'Apresentação do progresso do projeto'
    },
    {
      id: '2',
      title: 'Deadline - Landing Page',
      type: 'deadline',
      date: '2024-01-22',
      time: '18:00',
      duration: 0,
      client: 'Startup XYZ',
      attendees: [],
      description: 'Entrega final da landing page'
    },
    {
      id: '3',
      title: 'Workshop de Design',
      type: 'workshop',
      date: '2024-01-25',
      time: '09:00',
      duration: 240,
      client: 'Interno',
      attendees: ['Equipe Design'],
      description: 'Treinamento interno sobre novas tendências'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'deadline': return 'bg-red-100 text-red-800';
      case 'workshop': return 'bg-green-100 text-green-800';
      case 'task': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return '👥';
      case 'deadline': return '⏰';
      case 'workshop': return '🎓';
      case 'task': return '📋';
      default: return '📅';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'meeting': return 'Reunião';
      case 'deadline': return 'Prazo';
      case 'workshop': return 'Workshop';
      case 'task': return 'Tarefa';
      default: return type;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendário</h1>
          <p className="text-gray-600 mt-1">Gerencie compromissos e prazos</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Hoje</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 reuniões, 1 deadline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 desde a semana passada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reuniões</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prazos</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Próximos 7 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
          <CardDescription>Seus compromissos dos próximos dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(event.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <p className="text-gray-600 text-sm">{event.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Cliente: {event.client}</span>
                        {event.attendees.length > 0 && (
                          <span>Participantes: {event.attendees.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getTypeColor(event.type)}>
                      {getTypeText(event.type)}
                    </Badge>
                    <div className="mt-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="h-4 w-4" />
                        <span>{event.time} {event.duration > 0 && `(${event.duration}min)`}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mini Calendário Visual (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Janeiro 2024</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="font-semibold text-gray-500 p-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <div 
                key={day} 
                className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                  [15, 20, 22, 25].includes(day) ? 'bg-blue-100 text-blue-800 font-semibold' : ''
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
