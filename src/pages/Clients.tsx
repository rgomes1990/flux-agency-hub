
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientRegistration } from '@/components/ClientManagement/ClientRegistration';
import { TrafficTable } from '@/components/TrafficManagement/TrafficTable';
import { ServiceTable } from '@/components/ServiceManagement/ServiceTable';

export default function Clients() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Clientes</h1>
        <p className="text-gray-600 mt-2">Gerencie seus clientes, serviços e campanhas de tráfego pago</p>
      </div>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="traffic">Tráfego Pago</TabsTrigger>
          <TabsTrigger value="registration">Cadastro</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <ServiceTable />
        </TabsContent>

        <TabsContent value="traffic">
          <TrafficTable />
        </TabsContent>

        <TabsContent value="registration">
          <ClientRegistration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
