import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Filter, Download, Edit2 } from 'lucide-react';
import { StatusButton } from './StatusButton';
import { AddServiceModal } from './AddServiceModal';
import { CustomStatusModal } from './CustomStatusModal';

interface ServiceStatus {
  id: string;
  name: string;
  color: string;
}

interface ServiceItem {
  id: string;
  clientName: string;
  services: string;
  duration: number;
  price: number;
  clientStatus: string;
  title: string;
  texts: string;
  arts: string;
  posting: string;
  customColumns: { [key: string]: string };
  googleCalendar?: string;
}

const defaultStatuses: ServiceStatus[] = [
  { id: 'in-progress', name: 'Em Andamento', color: 'bg-red-500' },
  { id: 'partial-approval', name: 'Aprovação Parcial', color: 'bg-green-300' },
  { id: 'stopped', name: 'Parado', color: 'bg-red-800' },
  { id: 'client-pause', name: 'Cliente Pediu Pausa', color: 'bg-purple-500' },
  { id: 'send-approval', name: 'Enviar para Aprovação', color: 'bg-purple-300' },
  { id: 'waiting-approval', name: 'Aguardando Aprovação', color: 'bg-yellow-500' },
  { id: 'approved', name: 'Aprovado', color: 'bg-green-500' },
];

export function ServiceTable() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<ServiceStatus[]>(defaultStatuses);
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [filterText, setFilterText] = useState('');

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedServices = localStorage.getItem('services');
    const savedStatuses = localStorage.getItem('customStatuses');
    const savedColumns = localStorage.getItem('customColumns');
    
    if (savedServices) setServices(JSON.parse(savedServices));
    if (savedStatuses) setStatuses([...defaultStatuses, ...JSON.parse(savedStatuses)]);
    if (savedColumns) setCustomColumns(JSON.parse(savedColumns));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('services', JSON.stringify(services));
  }, [services]);

  const handleStatusChange = (serviceId: string, field: string, statusId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, [field]: statusId }
        : service
    ));
  };

  const handleCellEdit = (serviceId: string, field: string, value: string | number) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, [field]: value }
        : service
    ));
    setEditingCell(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(services.map(s => s.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, serviceId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== serviceId));
    }
  };

  const addCustomStatus = (status: ServiceStatus) => {
    const newStatuses = [...statuses, status];
    setStatuses(newStatuses);
    localStorage.setItem('customStatuses', JSON.stringify(newStatuses.filter(s => !defaultStatuses.find(ds => ds.id === s.id))));
  };

  const addCustomColumn = (columnName: string) => {
    const newColumns = [...customColumns, columnName];
    setCustomColumns(newColumns);
    localStorage.setItem('customColumns', JSON.stringify(newColumns));
  };

  const exportToCSV = () => {
    const headers = ['Cliente', 'Serviços', 'Duração (h)', 'Preço', 'Status Cliente', 'Título', 'Textos', 'Artes', 'Postagem', ...customColumns];
    const csvContent = [
      headers.join(','),
      ...services.map(service => [
        service.clientName,
        service.services,
        service.duration,
        service.price,
        service.clientStatus,
        service.title,
        service.texts,
        service.arts,
        service.posting,
        ...customColumns.map(col => service.customColumns[col] || '')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'servicos.csv';
    link.click();
  };

  const filteredServices = services.filter(service =>
    service.clientName.toLowerCase().includes(filterText.toLowerCase()) ||
    service.services.toLowerCase().includes(filterText.toLowerCase())
  );

  const EditableCell = ({ value, onSave, type = 'text' }: { value: string | number; onSave: (value: string | number) => void; type?: string }) => {
    const [editing, setEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    if (editing) {
      return (
        <Input
          value={tempValue}
          onChange={(e) => setTempValue(type === 'number' ? Number(e.target.value) : e.target.value)}
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

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciamento de Serviços</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setShowStatusModal(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Status Personalizado
              </Button>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Serviço
              </Button>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Filter className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar por cliente ou serviço..."
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === services.length && services.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Serviços</TableHead>
                  <TableHead>Duração (h)</TableHead>
                  <TableHead>Preço (R$)</TableHead>
                  <TableHead>Status Cliente</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Textos</TableHead>
                  <TableHead>Artes</TableHead>
                  <TableHead>Postagem</TableHead>
                  {customColumns.map(col => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(service.id)}
                        onCheckedChange={(checked) => handleSelectItem(service.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{service.clientName}</TableCell>
                    <TableCell>
                      <EditableCell
                        value={service.services}
                        onSave={(value) => handleCellEdit(service.id, 'services', value)}
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        value={service.duration}
                        onSave={(value) => handleCellEdit(service.id, 'duration', value)}
                        type="number"
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        value={service.price}
                        onSave={(value) => handleCellEdit(service.id, 'price', value)}
                        type="number"
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        value={service.clientStatus}
                        onSave={(value) => handleCellEdit(service.id, 'clientStatus', value)}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusButton
                        currentStatus={service.title}
                        statuses={statuses}
                        onStatusChange={(statusId) => handleStatusChange(service.id, 'title', statusId)}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusButton
                        currentStatus={service.texts}
                        statuses={statuses}
                        onStatusChange={(statusId) => handleStatusChange(service.id, 'texts', statusId)}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusButton
                        currentStatus={service.arts}
                        statuses={statuses}
                        onStatusChange={(statusId) => handleStatusChange(service.id, 'arts', statusId)}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusButton
                        currentStatus={service.posting}
                        statuses={statuses}
                        onStatusChange={(statusId) => handleStatusChange(service.id, 'posting', statusId)}
                      />
                    </TableCell>
                    {customColumns.map(col => (
                      <TableCell key={col}>
                        <StatusButton
                          currentStatus={service.customColumns[col] || ''}
                          statuses={statuses}
                          onStatusChange={(statusId) => handleStatusChange(service.id, `customColumns.${col}`, statusId)}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddServiceModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAdd={(service) => {
          setServices(prev => [...prev, { ...service, id: Date.now().toString() }]);
          setShowAddModal(false);
        }}
        customColumns={customColumns}
      />

      <CustomStatusModal
        open={showStatusModal}
        onOpenChange={setShowStatusModal}
        onAddStatus={addCustomStatus}
      />
    </div>
  );
}
