import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Copy,
  MoreHorizontal
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ContentItem {
  id: string;
  elemento: string;
  servicos: string;
  titulos: string;
  textos: string;
  artes: string;
  postagem: string;
  roteiro_videos: string;
  captacao: string;
  edicao_video: string;
  informacoes: string;
  pessoa?: string;
  observacoes?: string;
}

interface Group {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: ContentItem[];
}

const statusColors: { [key: string]: string } = {
  'Aprovados': 'bg-green-500',
  'Feito': 'bg-blue-500',
  'Parado': 'bg-red-500',
  'Vídeos': 'bg-purple-500',
  'Captações': 'bg-orange-500',
  'Programação Parcial': 'bg-cyan-400',
  'CLIENTE PEDIU PAR...': 'bg-red-600'
};

const StatusBadge = ({ status }: { status: string }) => {
  const colorClass = statusColors[status] || 'bg-gray-400';
  return (
    <Badge className={`${colorClass} text-white border-0 px-3 py-1 text-xs font-medium`}>
      {status}
    </Badge>
  );
};

export default function Content() {
  const [groups, setGroups] = useState<Group[]>([
    {
      id: 'outubro',
      name: 'OUTUBRO',
      color: 'bg-blue-500',
      isExpanded: true,
      items: [
        {
          id: '1',
          elemento: 'CT - VIDAS',
          servicos: '12 Artes + Conteúdo',
          titulos: 'Aprovados',
          textos: 'Aprovados',
          artes: 'Aprovados',
          postagem: 'Feito',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: '',
          pessoa: '👤'
        },
        {
          id: '2',
          elemento: 'Darja',
          servicos: '8 Conteúdos',
          titulos: 'Aprovados',
          textos: 'Aprovados',
          artes: 'Aprovados',
          postagem: 'Feito',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: 'Falta somente o vídeo (tema 08)',
          pessoa: '👤'
        },
        {
          id: '3',
          elemento: 'Dr. Renato Furtado',
          servicos: '8 Conteúdos',
          titulos: 'Aprovados',
          textos: 'Aprovados',
          artes: 'Aprovados',
          postagem: 'Feito',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: '',
          pessoa: '👤'
        },
        {
          id: '4',
          elemento: 'E-CAT',
          servicos: '2 Conteúdos',
          titulos: 'Aprovados',
          textos: 'Aprovados',
          artes: 'Aprovados',
          postagem: 'Feito',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: '',
          pessoa: '👤'
        },
        {
          id: '5',
          elemento: 'Eventare',
          servicos: '8 Artes + Conteúdo',
          titulos: 'Aprovados',
          textos: 'Aprovados',
          artes: 'Aprovados',
          postagem: 'Programação Parcial',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: '',
          pessoa: '👤'
        },
        {
          id: '6',
          elemento: 'Evoluc',
          servicos: '8 Conteúdos',
          titulos: 'Aprovados',
          textos: 'Aprovados',
          artes: 'Aprovados',
          postagem: 'Feito',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: '',
          pessoa: '👤'
        },
        {
          id: '7',
          elemento: 'Grupo Forte',
          servicos: '4 Conteúdos',
          titulos: 'Aprovados',
          textos: 'Aprovados',
          artes: 'Aprovados',
          postagem: 'Feito',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: '',
          pessoa: '👤'
        },
        {
          id: '8',
          elemento: 'Medicate',
          servicos: '8 Conteúdos',
          titulos: 'Aprovados',
          textos: 'Aprovados',
          artes: 'Aprovados',
          postagem: 'Feito',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: 'Faltando somente medi colors',
          pessoa: '👤'
        },
        {
          id: '9',
          elemento: 'Mizar Item Imobiliá...',
          servicos: '12 Conteúdos',
          titulos: 'Parado',
          textos: 'Parado',
          artes: 'Parado',
          postagem: 'Parado',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: '',
          pessoa: '👤'
        },
        {
          id: '10',
          elemento: 'N Delivery',
          servicos: '8 Conteúdos',
          titulos: 'CLIENTE PEDIU PAR...',
          textos: 'CLIENTE PEDIU PARA...',
          artes: 'CLIENTE PEDIU PAR...',
          postagem: 'CLIENTE PEDIU PAR...',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: '',
          pessoa: '👤'
        },
        {
          id: '11',
          elemento: 'NotePost',
          servicos: '8 Conteúdos',
          titulos: 'Aprovados',
          textos: 'Aprovados',
          artes: 'Aprovados',
          postagem: 'Feito',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: '',
          pessoa: '👤'
        },
        {
          id: '12',
          elemento: 'Padaria Century',
          servicos: '4 Conteúdos',
          titulos: 'Aprovados',
          textos: 'Aprovados',
          artes: 'Aprovados',
          postagem: 'Feito',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: '',
          pessoa: '👤'
        },
        {
          id: '13',
          elemento: 'Padaria Gran Royalle',
          servicos: '8 Conteúdos',
          titulos: 'Aprovados',
          textos: 'Aprovados',
          artes: 'Aprovados',
          postagem: 'Feito',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: '',
          pessoa: '👤'
        },
        {
          id: '14',
          elemento: 'Padaria Lisboa',
          servicos: '8 Conteúdos',
          titulos: 'Aprovados',
          textos: 'Aprovados',
          artes: 'Aprovados',
          postagem: 'Feito',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: '',
          pessoa: '👤'
        },
        {
          id: '15',
          elemento: 'Paulo Romeu Pro',
          servicos: '4 Conteúdos',
          titulos: 'Vídeos',
          textos: 'Parado',
          artes: 'Captações',
          postagem: 'Parado',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: '',
          pessoa: '👤'
        }
      ]
    }
  ]);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [newMonthName, setNewMonthName] = useState('');
  const [duplicateMonthName, setDuplicateMonthName] = useState('');
  const [selectedGroupToDuplicate, setSelectedGroupToDuplicate] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  const toggleGroup = (groupId: string) => {
    setGroups(groups.map(group => 
      group.id === groupId 
        ? { ...group, isExpanded: !group.isExpanded }
        : group
    ));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = groups.flatMap(group => group.items.map(item => item.id));
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const createNewMonth = () => {
    if (!newMonthName.trim()) return;
    
    const newGroup: Group = {
      id: newMonthName.toLowerCase().replace(/\s+/g, '-'),
      name: newMonthName.toUpperCase(),
      color: 'bg-orange-500',
      isExpanded: true,
      items: []
    };
    
    setGroups([...groups, newGroup]);
    setNewMonthName('');
    setShowCreateDialog(false);
  };

  const duplicateMonth = () => {
    if (!duplicateMonthName.trim() || !selectedGroupToDuplicate) return;
    
    const groupToDuplicate = groups.find(g => g.id === selectedGroupToDuplicate);
    if (!groupToDuplicate) return;
    
    const newGroup: Group = {
      id: duplicateMonthName.toLowerCase().replace(/\s+/g, '-'),
      name: duplicateMonthName.toUpperCase(),
      color: groupToDuplicate.color,
      isExpanded: true,
      items: groupToDuplicate.items.map(item => ({
        ...item,
        id: `${item.id}-${Date.now()}-${Math.random()}`
      }))
    };
    
    setGroups([...groups, newGroup]);
    setDuplicateMonthName('');
    setSelectedGroupToDuplicate('');
    setShowDuplicateDialog(false);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900">Criação Conteúdo</h1>
            <Button variant="ghost" size="sm">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Criar mês
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Mês</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Nome do mês"
                    value={newMonthName}
                    onChange={(e) => setNewMonthName(e.target.value)}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={createNewMonth} className="bg-orange-600 hover:bg-orange-700">
                      Criar
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-1" />
                  Duplicar mês
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {groups.map((group) => (
                  <DropdownMenuItem
                    key={group.id}
                    onClick={() => {
                      setSelectedGroupToDuplicate(group.id);
                      setShowDuplicateDialog(true);
                    }}
                  >
                    Duplicar {group.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Duplicar Mês</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Nome do novo mês"
                    value={duplicateMonthName}
                    onChange={(e) => setDuplicateMonthName(e.target.value)}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={duplicateMonth} className="bg-orange-600 hover:bg-orange-700">
                      Duplicar
                    </Button>
                    <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-full">
          {/* Table Header */}
          <div className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
            <div className="flex items-center min-w-max">
              <div className="w-8 flex items-center justify-center p-2">
                <Checkbox
                  checked={selectedItems.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </div>
              <div className="w-48 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Elemento</div>
              <div className="w-36 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Serviços</div>
              <div className="w-24 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Títulos</div>
              <div className="w-24 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Textos</div>
              <div className="w-24 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Artes</div>
              <div className="w-32 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Postagem</div>
              <div className="w-32 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Roteiro de Vídeos</div>
              <div className="w-24 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Captação</div>
              <div className="w-32 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Edição de Vídeo</div>
              <div className="w-48 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Informações</div>
              <div className="w-24 p-2 text-xs font-medium text-gray-600">Pessoa</div>
            </div>
          </div>

          {/* Table Body */}
          {groups.map((group) => (
            <div key={group.id}>
              {/* Group Header */}
              <div 
                className="bg-orange-50 border-b border-gray-200 cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => toggleGroup(group.id)}
              >
                <div className="flex items-center min-w-max">
                  <div className="w-8 flex items-center justify-center p-2">
                    {group.isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 p-2">
                    <div className={`w-3 h-3 rounded ${group.color}`}></div>
                    <span className="font-medium text-gray-900">{group.name}</span>
                  </div>
                </div>
              </div>

              {/* Group Items */}
              {group.isExpanded && group.items.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center min-w-max">
                    <div className="w-8 flex items-center justify-center p-2">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                      />
                    </div>
                    <div className="w-48 p-2 text-sm text-gray-900 border-r border-gray-200 font-medium">
                      {item.elemento}
                    </div>
                    <div className="w-36 p-2 text-sm text-gray-600 border-r border-gray-200">
                      {item.servicos}
                    </div>
                    <div className="w-24 p-2 border-r border-gray-200">
                      {item.titulos && <StatusBadge status={item.titulos} />}
                    </div>
                    <div className="w-24 p-2 border-r border-gray-200">
                      {item.textos && <StatusBadge status={item.textos} />}
                    </div>
                    <div className="w-24 p-2 border-r border-gray-200">
                      {item.artes && <StatusBadge status={item.artes} />}
                    </div>
                    <div className="w-32 p-2 border-r border-gray-200">
                      {item.postagem && <StatusBadge status={item.postagem} />}
                    </div>
                    <div className="w-32 p-2 border-r border-gray-200">
                      {item.roteiro_videos && <StatusBadge status={item.roteiro_videos} />}
                    </div>
                    <div className="w-24 p-2 border-r border-gray-200">
                      {item.captacao && <StatusBadge status={item.captacao} />}
                    </div>
                    <div className="w-32 p-2 border-r border-gray-200">
                      {item.edicao_video && <StatusBadge status={item.edicao_video} />}
                    </div>
                    <div className="w-48 p-2 text-sm text-gray-600 border-r border-gray-200">
                      {item.informacoes}
                    </div>
                    <div className="w-24 p-2 text-center">
                      {item.pessoa}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
