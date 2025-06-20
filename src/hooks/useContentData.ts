
import { useState, useEffect } from 'react';

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

export const useContentData = () => {
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
        }
        // ... resto dos itens iniciais
      ]
    }
  ]);

  // Carregar dados do localStorage ao inicializar
  useEffect(() => {
    const savedData = localStorage.getItem('contentData');
    if (savedData) {
      try {
        setGroups(JSON.parse(savedData));
      } catch (error) {
        console.error('Erro ao carregar dados do conteúdo:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que groups mudar
  useEffect(() => {
    localStorage.setItem('contentData', JSON.stringify(groups));
  }, [groups]);

  const updateGroups = (newGroups: Group[]) => {
    setGroups(newGroups);
  };

  const createMonth = (monthName: string) => {
    const newGroup: Group = {
      id: monthName.toLowerCase().replace(/\s+/g, '-'),
      name: monthName.toUpperCase(),
      color: 'bg-orange-500',
      isExpanded: true,
      items: []
    };
    
    setGroups([...groups, newGroup]);
    return newGroup.id;
  };

  const duplicateMonth = (sourceGroupId: string, newMonthName: string) => {
    const groupToDuplicate = groups.find(g => g.id === sourceGroupId);
    if (!groupToDuplicate) return null;
    
    const newGroup: Group = {
      id: newMonthName.toLowerCase().replace(/\s+/g, '-'),
      name: newMonthName.toUpperCase(),
      color: groupToDuplicate.color,
      isExpanded: true,
      items: groupToDuplicate.items.map(item => ({
        ...item,
        id: `${item.id}-${Date.now()}-${Math.random()}`
      }))
    };
    
    setGroups([...groups, newGroup]);
    return newGroup.id;
  };

  return {
    groups,
    updateGroups,
    createMonth,
    duplicateMonth
  };
};
