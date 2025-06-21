
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
  [key: string]: any; // Para colunas dinâmicas
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

interface ContentColumn {
  id: string;
  name: string;
  type: 'status' | 'text';
  isDefault?: boolean;
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

  const [columns, setColumns] = useState<ContentColumn[]>([
    { id: 'titulos', name: 'Títulos', type: 'status', isDefault: true },
    { id: 'textos', name: 'Textos', type: 'status', isDefault: true },
    { id: 'artes', name: 'Artes', type: 'status', isDefault: true },
    { id: 'postagem', name: 'Postagem', type: 'status', isDefault: true },
    { id: 'roteiro_videos', name: 'Roteiro de Vídeos', type: 'status', isDefault: true },
    { id: 'captacao', name: 'Captação', type: 'status', isDefault: true },
    { id: 'edicao_video', name: 'Edição de Vídeo', type: 'status', isDefault: true },
    { id: 'informacoes', name: 'Informações', type: 'text', isDefault: true }
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
    const savedColumns = localStorage.getItem('contentColumns');
    
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

    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns));
      } catch (error) {
        console.error('Erro ao carregar colunas:', error);
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

  // Salvar colunas no localStorage sempre que columns mudar
  useEffect(() => {
    localStorage.setItem('contentColumns', JSON.stringify(columns));
  }, [columns]);

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
    
    // Refresh automático após duplicar
    setTimeout(() => {
      window.location.reload();
    }, 500);
    
    return newGroup.id;
  };

  const addStatus = (status: ServiceStatus) => {
    setStatuses(prev => [...prev, status]);
  };

  const updateStatus = (statusId: string, updates: Partial<ServiceStatus>) => {
    setStatuses(prev => prev.map(status => 
      status.id === statusId ? { ...status, ...updates } : status
    ));
  };

  const deleteStatus = (statusId: string) => {
    setStatuses(prev => prev.filter(status => status.id !== statusId));
  };

  const addColumn = (name: string, type: 'status' | 'text') => {
    const newColumn: ContentColumn = {
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      type,
      isDefault: false
    };
    setColumns(prev => [...prev, newColumn]);
    
    // Adicionar a nova coluna a todos os itens existentes
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => ({
        ...item,
        [newColumn.id]: type === 'status' ? '' : ''
      }))
    })));
  };

  const deleteColumn = (columnId: string) => {
    const columnToDelete = columns.find(col => col.id === columnId);
    if (columnToDelete?.isDefault) return; // Não permitir deletar colunas padrão
    
    setColumns(prev => prev.filter(col => col.id !== columnId));
    
    // Remover a coluna de todos os itens existentes
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => {
        const { [columnId]: removed, ...rest } = item;
        return rest;
      })
    })));
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

    // Adicionar campos das colunas personalizadas
    columns.forEach(column => {
      if (!column.isDefault) {
        newClient[column.id] = column.type === 'status' ? '' : '';
      }
    });

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
    columns,
    statuses,
    updateGroups,
    createMonth,
    duplicateMonth,
    addStatus,
    updateStatus,
    deleteStatus,
    addColumn,
    deleteColumn,
    updateItemStatus,
    addClient,
    deleteClient,
    updateClient
  };
};
