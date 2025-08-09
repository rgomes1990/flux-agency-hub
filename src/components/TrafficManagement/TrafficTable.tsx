
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Filter, Download, Edit2, Calendar } from 'lucide-react';
import { StatusButton } from '../ServiceManagement/StatusButton';

interface TrafficCampaign {
  id: string;
  clientName: string;
  rechargeDate: string;
  billingEmail: string;
  whatsapp: string;
  budget: string;
  accountCredit: string;
  campaignStatus: string;
}

interface ServiceStatus {
  id: string;
  name: string;
  color: string;
}

const creditStatuses: ServiceStatus[] = [
  { id: 'with-balance', name: 'Conta com Saldo', color: 'bg-green-500' },
  { id: 'no-balance', name: 'Conta sem Saldo', color: 'bg-red-500' },
  { id: 'awaiting-payment', name: 'Aguardando Pagamento', color: 'bg-yellow-500' },
  { id: 'card-linked', name: 'Vinculado ao Cartão', color: 'bg-blue-500' },
  { id: 'paused', name: 'Em Pausa', color: 'bg-gray-500' },
];

const campaignStatuses: ServiceStatus[] = [
  { id: 'active', name: 'Campanha Ativa', color: 'bg-green-500' },
  { id: 'inactive', name: 'Campanha Desativada', color: 'bg-red-500' },
  { id: 'in-progress', name: 'Em Andamento', color: 'bg-orange-500' },
];

export function TrafficTable() {
  const [campaigns, setCampaigns] = useState<TrafficCampaign[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterText, setFilterText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const savedCampaigns = localStorage.getItem('trafficCampaigns');
    if (savedCampaigns) setCampaigns(JSON.parse(savedCampaigns));
  }, []);

  useEffect(() => {
    localStorage.setItem('trafficCampaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  const handleStatusChange = (campaignId: string, field: string, statusId: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, [field]: statusId }
        : campaign
    ));
  };

  const handleCellEdit = (campaignId: string, field: string, value: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, [field]: value }
        : campaign
    ));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(campaigns.map(c => c.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (campaignId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, campaignId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== campaignId));
    }
  };

  const exportToCSV = () => {
    const headers = ['Cliente', 'Data da Recarga', 'E-mail', 'WhatsApp', 'Orçamento', 'Crédito da Conta', 'Status da Campanha'];
    const csvContent = [
      headers.join(','),
      ...campaigns.map(campaign => [
        campaign.clientName,
        campaign.rechargeDate,
        campaign.billingEmail,
        campaign.whatsapp,
        campaign.budget,
        campaign.accountCredit,
        campaign.campaignStatus
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'campanhas-trafego.csv';
    link.click();
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.clientName.toLowerCase().includes(filterText.toLowerCase()) ||
    campaign.billingEmail.toLowerCase().includes(filterText.toLowerCase())
  );

  const EditableCell = ({ value, onSave, type = 'text' }: { value: string; onSave: (value: string) => void; type?: string }) => {
    const [editing, setEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    if (editing) {
      return (
        <Input
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => {
            onSave(tempValue);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSave(tempValue);
              setEditing(false);
            }
          }}
          className="h-8"
          type={type}
          autoFocus
        />
      );
    }

    return (
      <div 
        className="cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center justify-between group"
        onClick={() => setEditing(true)}
      >
        <span>{value}</span>
        <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-50" />
      </div>
    );
  };

  const addNewCampaign = () => {
    const newCampaign: TrafficCampaign = {
      id: Date.now().toString(),
      clientName: 'Novo Cliente',
      rechargeDate: new Date().toISOString().split('T')[0],
      billingEmail: 'cliente@email.com',
      whatsapp: '(11) 99999-9999',
      budget: 'R$ 0,00',
      accountCredit: 'no-balance',
      campaignStatus: 'inactive'
    };
    
    setCampaigns(prev => [...prev, newCampaign]);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciamento de Tráfego Pago</CardTitle>
            <div className="flex gap-2">
              <Button onClick={addNewCampaign}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Campanha
              </Button>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Filter className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar por cliente ou e-mail..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse" style={{ minWidth: '1200px' }}>
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-12">
                    <Checkbox
                      checked={selectedItems.length === campaigns.length && campaigns.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-48">Cliente</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-40">Data da Recarga</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-80">E-mail para Cobrança</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-72">WhatsApp</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-36">Orçamento</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-80">Crédito da Conta</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-80">Status da Campanha</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      <Checkbox
                        checked={selectedItems.includes(campaign.id)}
                        onCheckedChange={(checked) => handleSelectItem(campaign.id, !!checked)}
                      />
                    </td>
                    <td className="p-4 align-middle font-medium">
                      <EditableCell
                        value={campaign.clientName}
                        onSave={(value) => handleCellEdit(campaign.id, 'clientName', value)}
                      />
                    </td>
                    <td className="p-4 align-middle">
                      <EditableCell
                        value={campaign.rechargeDate}
                        onSave={(value) => handleCellEdit(campaign.id, 'rechargeDate', value)}
                        type="date"
                      />
                    </td>
                    <td className="p-4 align-middle">
                      <EditableCell
                        value={campaign.billingEmail}
                        onSave={(value) => handleCellEdit(campaign.id, 'billingEmail', value)}
                        type="email"
                      />
                    </td>
                    <td className="p-4 align-middle">
                      <EditableCell
                        value={campaign.whatsapp}
                        onSave={(value) => handleCellEdit(campaign.id, 'whatsapp', value)}
                        type="tel"
                      />
                    </td>
                    <td className="p-4 align-middle">
                      <EditableCell
                        value={campaign.budget}
                        onSave={(value) => handleCellEdit(campaign.id, 'budget', value)}
                      />
                    </td>
                    <td className="p-4 align-middle">
                      <StatusButton
                        currentStatus={campaign.accountCredit}
                        statuses={creditStatuses}
                        onStatusChange={(statusId) => handleStatusChange(campaign.id, 'accountCredit', statusId)}
                      />
                    </td>
                    <td className="p-4 align-middle">
                      <StatusButton
                        currentStatus={campaign.campaignStatus}
                        statuses={campaignStatuses}
                        onStatusChange={(statusId) => handleStatusChange(campaign.id, 'campaignStatus', statusId)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
