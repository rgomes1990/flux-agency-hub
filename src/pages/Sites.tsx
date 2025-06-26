
import React from 'react';
import { useSitesData } from '@/hooks/useSitesData';
import { SitesTable } from '@/components/SitesManagement/SitesTable';

export default function Sites() {
  const sitesData = useSitesData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Criação de Sites</h1>
          <p className="text-gray-600 mt-1">Gerencie seus projetos de criação de sites</p>
        </div>
      </div>

      <SitesTable 
        {...sitesData}
        moduleType="sites"
        addClientButtonText="Adicionar Cliente"
        createMonthButtonText="Criar Mês"
        noDataMessage="Nenhum projeto de site encontrado. Crie um mês para começar."
      />
    </div>
  );
}
