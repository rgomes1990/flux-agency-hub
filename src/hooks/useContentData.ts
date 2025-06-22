
import { useState, useEffect } from 'react';

export interface ContentData {
  id: string;
  cliente: string;
  mes: string;
  tipoConteudo: string;
  plataforma: string;
  status: string;
  dataPublicacao?: string;
  observacoes?: string;
  attachments?: File[];
}

export const useContentData = () => {
  const [data, setData] = useState<ContentData[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem('contentData');
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (error) {
        console.error('Erro ao carregar dados de conteúdo:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('contentData', JSON.stringify(data));
  }, [data]);

  const addData = (newData: Omit<ContentData, 'id'>) => {
    const dataWithId: ContentData = {
      ...newData,
      id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setData(prev => [dataWithId, ...prev]);
    return dataWithId.id;
  };

  const updateData = (id: string, updates: Partial<ContentData>) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteData = (id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
  };

  const duplicateMonth = (mes: string) => {
    const monthData = data.filter(item => item.mes === mes);
    
    if (monthData.length === 0) {
      console.warn('Nenhum dado encontrado para o mês:', mes);
      return;
    }

    // Criar uma nova data baseada no mês atual + 1
    const [year, month] = mes.split('-');
    const nextMonth = new Date(parseInt(year), parseInt(month), 1);
    const newMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

    // Usar setTimeout para evitar travamento da UI
    setTimeout(() => {
      const duplicatedData = monthData.map(item => ({
        ...item,
        id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        mes: newMonth,
        status: 'planejado', // Status padrão para conteúdo duplicado
        dataPublicacao: undefined // Remover data de publicação
      }));

      setData(prev => [...duplicatedData, ...prev]);
    }, 100);
  };

  const getClients = () => {
    const clients = [...new Set(data.map(item => item.cliente))];
    return clients.sort();
  };

  const getMonths = () => {
    const months = [...new Set(data.map(item => item.mes))];
    return months.sort().reverse();
  };

  return {
    data,
    addData,
    updateData,
    deleteData,
    duplicateMonth,
    getClients,
    getMonths
  };
};
