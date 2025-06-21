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
  attachments?: { name: string; data: string; type: string }[]; // Changed to serializable format
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

// Helper function to convert File to serializable format
const fileToSerializable = async (file: File): Promise<{ name: string; data: string; type: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        data: reader.result as string,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  });
};

// Helper function to convert serializable format back to File
const serializableToFile = (serialized: { name: string; data: string; type: string }): File => {
  const byteCharacters = atob(serialized.data.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new File([byteArray], serialized.name, { type: serialized.type });
};

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

  const updateMonth = (groupId: string, newName: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, name: newName.toUpperCase() }
        : group
    ));
  };

  const deleteMonth = (groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const duplicateMonth = (sourceGroupId: string, newMonthName: string) => {
    try {
      const groupToDuplicate = groups.find(g => g.id === sourceGroupId);
      if (!groupToDuplicate) {
        console.error('Grupo não encontrado para duplicação:', sourceGroupId);
        return null;
      }
      
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      
      const newGroup: Group = {
        id: `${newMonthName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${randomId}`,
        name: newMonthName.toUpperCase(),
        color: groupToDuplicate.color,
        isExpanded: true,
        items: groupToDuplicate.items.map((item, index) => {
          const newItemId = `content-${newMonthName.toLowerCase()}-${timestamp}-${index}`;
          console.log('Criando novo item:', newItemId);
          
          return {
            ...item,
            id: newItemId,
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
          };
        })
      };
      
      console.log('Duplicando grupo:', newGroup);
      setGroups(prev => {
        const updated = [...prev, newGroup];
        console.log('Grupos atualizados:', updated.length);
        return updated;
      });
      
      return newGroup.id;
    } catch (error) {
      console.error('Erro ao duplicar mês:', error);
      return null;
    }
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
    // Allow deletion of any column, including default ones
    setColumns(prev => prev.filter(col => col.id !== columnId));
    
    // Remover a coluna de todos os itens existentes mantendo a tipagem correta
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => {
        const updatedItem = { ...item };
        delete updatedItem[columnId];
        return updatedItem;
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

  const updateClient = async (itemId: string, updates: Partial<ContentItem>) => {
    // Convert File objects to serializable format if attachments are being updated
    if (updates.attachments && updates.attachments.length > 0) {
      const firstAttachment = updates.attachments[0];
      if (firstAttachment instanceof File) {
        const serializedFile = await fileToSerializable(firstAttachment);
        updates.attachments = [serializedFile as any];
      }
    }

    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId 
          ? { ...item, ...updates }
          : item
      )
    })));
  };

  // Helper function to get File objects from attachments
  const getClientFiles = (clientId: string): File[] => {
    const client = groups.flatMap(g => g.items).find(item => item.id === clientId);
    if (!client?.attachments) return [];
    
    return client.attachments.map(attachment => {
      if ('data' in attachment && 'name' in attachment && 'type' in attachment) {
        return serializableToFile(attachment as { name: string; data: string; type: string });
      }
      return attachment as File;
    });
  };

  return {
    groups,
    columns,
    statuses,
    updateGroups,
    createMonth,
    updateMonth,
    deleteMonth,
    duplicateMonth,
    addStatus,
    updateStatus,
    deleteStatus,
    addColumn,
    deleteColumn,
    updateItemStatus,
    addClient,
    deleteClient,
    updateClient,
    getClientFiles
  };
};
