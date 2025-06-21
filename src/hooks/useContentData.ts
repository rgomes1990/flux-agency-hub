
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
  observacoes?: string;
  attachments?: File[];
}

interface Group {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: ContentItem[];
}

interface ServiceStatus {
  id: string;
  name: string;
  color: string;
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
          titulos: 'aprovados',
          textos: 'aprovados',
          artes: 'aprovados',
          postagem: 'feito',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: 'Falta somente o vídeo (tema 08)'
        },
        {
          id: '2',
          elemento: 'Darja',
          servicos: '8 Conteúdos',
          titulos: 'aprovados',
          textos: 'aprovados',
          artes: 'aprovados',
          postagem: 'feito',
          roteiro_videos: '',
          captacao: '',
          edicao_video: '',
          informacoes: 'Falta somente o vídeo (tema 08)'
        }
      ]
    }
  ]);

  const [statuses, setStatuses] = useState<ServiceStatus[]>([
    { id: 'aprovados', name: 'Aprovados', color: 'bg-green-500' },
    { id: 'feito', name: 'Feito', color: 'bg-blue-500' },
    { id: 'parado', name: 'Parado', color: 'bg-red-500' },
    { id: 'em-andamento', name: 'Em Andamento', color: 'bg-yellow-500' },
    { id: 'revisao', name: 'Em Revisão', color: 'bg-purple-500' }
  ]);

  // Carregar dados do localStorage ao inicializar
  useEffect(() => {
    const savedData = localStorage.getItem('contentData');
    const savedStatuses = localStorage.getItem('contentStatuses');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setGroups(parsedData);
      } catch (error) {
        console.error('Erro ao carregar dados do conteúdo:', error);
      }
    }
    
    if (savedStatuses) {
      try {
        setStatuses(JSON.parse(savedStatuses));
      } catch (error) {
        console.error('Erro ao carregar status:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que groups mudar
  useEffect(() => {
    localStorage.setItem('contentData', JSON.stringify(groups));
  }, [groups]);

  // Salvar status no localStorage sempre que statuses mudar
  useEffect(() => {
    localStorage.setItem('contentStatuses', JSON.stringify(statuses));
  }, [statuses]);

  const updateGroups = (newGroups: Group[]) => {
    setGroups(newGroups);
  };

  const createMonth = (monthName: string) => {
    const newGroup: Group = {
      id: `${monthName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: monthName.toUpperCase(),
      color: 'bg-orange-500',
      isExpanded: true,
      items: []
    };
    
    setGroups(prev => [...prev, newGroup]);
    return newGroup.id;
  };

  const duplicateMonth = (sourceGroupId: string, newMonthName: string) => {
    const groupToDuplicate = groups.find(g => g.id === sourceGroupId);
    if (!groupToDuplicate) return null;
    
    const newGroup: Group = {
      id: `${newMonthName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: newMonthName.toUpperCase(),
      color: groupToDuplicate.color,
      isExpanded: true,
      items: groupToDuplicate.items.map(item => ({
        ...item,
        id: `${item.id}-copy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        // Reset status fields for new month
        titulos: '',
        textos: '',
        artes: '',
        postagem: '',
        roteiro_videos: '',
        captacao: '',
        edicao_video: '',
        informacoes: '',
        observacoes: '',
        attachments: []
      }))
    };
    
    setGroups(prev => [...prev, newGroup]);
    return newGroup.id;
  };

  const addStatus = (status: ServiceStatus) => {
    setStatuses(prev => [...prev, status]);
  };

  const updateItemStatus = (itemId: string, field: string, statusId: string) => {
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId 
          ? { ...item, [field]: statusId }
          : item
      )
    })));
  };

  const addClient = (groupId: string, clientData: Partial<ContentItem>) => {
    const newClient: ContentItem = {
      id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      elemento: clientData.elemento || 'Novo Cliente',
      servicos: clientData.servicos || '',
      titulos: '',
      textos: '',
      artes: '',
      postagem: '',
      roteiro_videos: '',
      captacao: '',
      edicao_video: '',
      informacoes: '',
      attachments: []
    };

    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, items: [...group.items, newClient] }
        : group
    ));

    return newClient.id;
  };

  const deleteClient = (itemId: string) => {
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== itemId)
    })));
  };

  const updateClient = (itemId: string, updates: Partial<ContentItem>) => {
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId 
          ? { ...item, ...updates }
          : item
      )
    })));
  };

  return {
    groups,
    statuses,
    updateGroups,
    createMonth,
    duplicateMonth,
    addStatus,
    updateItemStatus,
    addClient,
    deleteClient,
    updateClient
  };
};
