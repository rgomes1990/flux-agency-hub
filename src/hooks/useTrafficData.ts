
import { useState, useEffect } from 'react';

export interface TrafficData {
  id: string;
  cliente: string;
  mes: string;
  status: string; // Added this property
  investimento: number;
  resultado: number;
  roi: number;
  roas: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversoes: number;
  attachments?: File[];
  observacoes?: string;
}

export const useTrafficData = () => {
  const [data, setData] = useState<TrafficData[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem('trafficData');
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (error) {
        console.error('Erro ao carregar dados de tráfego:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('trafficData', JSON.stringify(data));
  }, [data]);

  const addData = (newData: Omit<TrafficData, 'id'>) => {
    const dataWithId: TrafficData = {
      ...newData,
      id: `traffic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setData(prev => [dataWithId, ...prev]);
    return dataWithId.id;
  };

  const updateData = (id: string, updates: Partial<TrafficData>) => {
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
        id: `traffic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        mes: newMonth,
        // Resetar métricas de resultado
        resultado: 0,
        conversoes: 0,
        roi: 0,
        roas: 0
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
