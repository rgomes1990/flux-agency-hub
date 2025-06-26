
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Filter, 
  Download, 
  Edit2, 
  Trash2, 
  Copy, 
  ChevronDown, 
  ChevronRight,
  MoreHorizontal,
  FileText,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AttachmentViewer } from '@/components/AttachmentViewer';

interface SiteItem {
  id: string;
  elemento: string;
  servicos: string;
  informacoes: string;
  observacoes?: string;
  attachments?: { name: string; data: string; type: string }[];
  [key: string]: any;
}

interface SiteGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
  items: SiteItem[];
}

interface SiteColumn {
  id: string;
  name: string;
  type: 'status' | 'text';
  isDefault?: boolean;
}

interface ServiceStatus {
  id: string;
  name: string;
  color: string;
}

interface SitesTableProps {
  groups: SiteGroup[];
  columns: SiteColumn[];
  customColumns: SiteColumn[];
  statuses: ServiceStatus[];
  moduleType: string;
  addClientButtonText: string;
  createMonthButtonText: string;
  noDataMessage: string;
  updateGroups: (newGroups: SiteGroup[]) => Promise<void>;
  createMonth: (monthName: string) => Promise<string | undefined>;
  addClient: (groupId: string, clientData: Partial<SiteItem>) => Promise<string | undefined>;
  addColumn: (name: string, type: 'status' | 'text') => Promise<void>;
  addStatus: (status: ServiceStatus) => Promise<void>;
  updateStatus: (statusId: string, updates: Partial<ServiceStatus>) => Promise<void>;
  deleteStatus: (statusId: string) => Promise<void>;
  updateColumn: (id: string, updates: Partial<SiteColumn>) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  updateItemStatus: (itemId: string, field: string, statusId: string) => Promise<void>;
  deleteClient: (itemId: string) => Promise<void>;
  updateClient: (itemId: string, updates: Partial<SiteItem>) => Promise<void>;
  getClientFiles: (clientId: string) => File[];
  updateMonth: (groupId: string, newName: string) => Promise<void>;
  deleteMonth: (groupId: string) => Promise<void>;
  duplicateMonth: (sourceGroupId: string, newMonthName: string) => Promise<string | undefined>;
}

export function SitesTable({
  groups,
  columns,
  customColumns,
  statuses,
  moduleType,
  addClientButtonText,
  createMonthButtonText,
  noDataMessage,
  updateGroups,
  createMonth,
  addClient,
  addColumn,
  addStatus,
  updateStatus,
  deleteStatus,
  updateColumn,
  deleteColumn,
  updateItemStatus,
  deleteClient,
  updateClient,
  getClientFiles,
  updateMonth,
  deleteMonth,
  duplicateMonth
}: SitesTableProps) {
  const [showCreateMonthDialog, setShowCreateMonthDialog] = useState(false);
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [showAddColumnDialog, setShowAddColumnDialog] = useState(false);
  const [showAddStatusDialog, setShowAddStatusDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [newMonthName, setNewMonthName] = useState('');
  const [newClientData, setNewClientData] = useState({ elemento: '', servicos: '' });
  const [newColumnData, setNewColumnData] = useState({ name: '', type: 'text' as 'text' | 'status' });
  const [newStatusData, setNewStatusData] = useState({ name: '', color: 'bg-blue-500' });
  const [editingCell, setEditingCell] = useState<{ itemId: string; field: string } | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterText, setFilterText] = useState('');

  const handleCreateMonth = async () => {
    if (!newMonthName.trim()) return;
    
    try {
      await createMonth(newMonthName);
      setNewMonthName('');
      setShowCreateMonthDialog(false);
    } catch (error) {
      console.error('Erro ao criar mês:', error);
    }
  };

  const handleAddClient = async () => {
    if (!selectedGroupId || !newClientData.elemento.trim()) return;
    
    try {
      await addClient(selectedGroupId, newClientData);
      setNewClientData({ elemento: '', servicos: '' });
      setShowAddClientDialog(false);
      setSelectedGroupId('');
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnData.name.trim()) return;
    
    try {
      await addColumn(newColumnData.name, newColumnData.type);
      setNewColumnData({ name: '', type: 'text' });
      setShowAddColumnDialog(false);
    } catch (error) {
      console.error('Erro ao adicionar coluna:', error);
    }
  };

  const handleAddStatus = async () => {
    if (!newStatusData.name.trim()) return;
    
    try {
      const statusId = newStatusData.name.toLowerCase().replace(/\s+/g, '_');
      await addStatus({
        id: statusId,
        name: newStatusData.name,
        color: newStatusData.color
      });
      setNewStatusData({ name: '', color: 'bg-blue-500' });
      setShowAddStatusDialog(false);
    } catch (error) {
      console.error('Erro ao adicionar status:', error);
    }
  };

  const handleCellEdit = (itemId: string, field: string, currentValue: string) => {
    setEditingCell({ itemId, field });
    setEditingValue(currentValue);
  };

  const handleCellSave = async () => {
    if (!editingCell) return;
    
    try {
      await updateClient(editingCell.itemId, { [editingCell.field]: editingValue });
      setEditingCell(null);
      setEditingValue('');
    } catch (error) {
      console.error('Erro ao salvar célula:', error);
    }
  };

  const handleFileUpload = async (itemId: string, file: File) => {
    try {
      await updateClient(itemId, { attachments: [file] });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    }
  };

  const toggleGroupExpansion = async (groupId: string) => {
    const newGroups = groups.map(group => 
      group.id === groupId 
        ? { ...group, isExpanded: !group.isExpanded }
        : group
    );
    await updateGroups(newGroups);
  };

  const StatusButton = ({ currentStatus, onStatusChange }: { currentStatus: string; onStatusChange: (statusId: string) => void }) => {
    const status = statuses.find(s => s.id === currentStatus);
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className={`${status?.color || 'bg-gray-100'} text-white border-none`}
          >
            {status?.name || 'Selecionar'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {statuses.map(statusOption => (
            <DropdownMenuItem 
              key={statusOption.id}
              onClick={() => onStatusChange(statusOption.id)}
              className="cursor-pointer"
            >
              <div className={`w-3 h-3 rounded-full ${statusOption.color} mr-2`} />
              {statusOption.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const EditableCell = ({ value, onSave }: { value: string; onSave: (value: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    const handleSave = () => {
      onSave(tempValue);
      setIsEditing(false);
    };

    if (isEditing) {
      return (
        <Input
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          className="h-8"
          autoFocus
        />
      );
    }

    return (
      <div 
        className="cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center justify-between group"
        onClick={() => setIsEditing(true)}
      >
        <span className="truncate">{value || 'Clique para editar'}</span>
        <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-50" />
      </div>
    );
  };

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">{noDataMessage}</p>
        <Dialog open={showCreateMonthDialog} onOpenChange={setShowCreateMonthDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {createMonthButtonText}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Mês</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="month-name">Nome do Mês</Label>
                <Input
                  id="month-name"
                  value={newMonthName}
                  onChange={(e) => setNewMonthName(e.target.value)}
                  placeholder="Ex: Janeiro"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateMonthDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateMonth}>
                  Criar Mês
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Dialog open={showCreateMonthDialog} onOpenChange={setShowCreateMonthDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {createMonthButtonText}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Mês</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="month-name">Nome do Mês</Label>
                  <Input
                    id="month-name"
                    value={newMonthName}
                    onChange={(e) => setNewMonthName(e.target.value)}
                    placeholder="Ex: Janeiro"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateMonthDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateMonth}>
                    Criar Mês
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddColumnDialog} onOpenChange={setShowAddColumnDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Coluna
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Coluna</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="column-name">Nome da Coluna</Label>
                  <Input
                    id="column-name"
                    value={newColumnData.name}
                    onChange={(e) => setNewColumnData({ ...newColumnData, name: e.target.value })}
                    placeholder="Ex: Status do Projeto"
                  />
                </div>
                <div>
                  <Label htmlFor="column-type">Tipo da Coluna</Label>
                  <Select 
                    value={newColumnData.type} 
                    onValueChange={(value: 'text' | 'status') => setNewColumnData({ ...newColumnData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddColumnDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddColumn}>
                    Adicionar Coluna
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddStatusDialog} onOpenChange={setShowAddStatusDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Status</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status-name">Nome do Status</Label>
                  <Input
                    id="status-name"
                    value={newStatusData.name}
                    onChange={(e) => setNewStatusData({ ...newStatusData, name: e.target.value })}
                    placeholder="Ex: Em Andamento"
                  />
                </div>
                <div>
                  <Label htmlFor="status-color">Cor do Status</Label>
                  <Select 
                    value={newStatusData.color} 
                    onValueChange={(value) => setNewStatusData({ ...newStatusData, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bg-red-500">Vermelho</SelectItem>
                      <SelectItem value="bg-yellow-500">Amarelo</SelectItem>
                      <SelectItem value="bg-green-500">Verde</SelectItem>
                      <SelectItem value="bg-blue-500">Azul</SelectItem>
                      <SelectItem value="bg-purple-500">Roxo</SelectItem>
                      <SelectItem value="bg-gray-500">Cinza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddStatusDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddStatus}>
                    Adicionar Status
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Filter className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Filtrar..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {groups.map((group) => (
        <Card key={group.id} className="overflow-hidden">
          <CardHeader className={`${group.color} text-white`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleGroupExpansion(group.id)}
                  className="text-white hover:bg-white/20 p-1"
                >
                  {group.isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {group.items.length} itens
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Dialog open={showAddClientDialog && selectedGroupId === group.id} onOpenChange={(open) => {
                  setShowAddClientDialog(open);
                  if (open) setSelectedGroupId(group.id);
                  else setSelectedGroupId('');
                }}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Plus className="h-4 w-4 mr-1" />
                      {addClientButtonText}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Cliente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="client-elemento">Cliente/Elemento</Label>
                        <Input
                          id="client-elemento"
                          value={newClientData.elemento}
                          onChange={(e) => setNewClientData({ ...newClientData, elemento: e.target.value })}
                          placeholder="Nome do cliente"
                        />
                      </div>
                      <div>
                        <Label htmlFor="client-servicos">Serviços</Label>
                        <Input
                          id="client-servicos"
                          value={newClientData.servicos}
                          onChange={(e) => setNewClientData({ ...newClientData, servicos: e.target.value })}
                          placeholder="Descrição dos serviços"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowAddClientDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddClient}>
                          Adicionar Cliente
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          {group.isExpanded && (
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox />
                      </TableHead>
                      <TableHead>Cliente/Elemento</TableHead>
                      <TableHead>Serviços</TableHead>
                      <TableHead>Informações</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead>Anexos</TableHead>
                      {customColumns.map(column => (
                        <TableHead key={column.id}>{column.name}</TableHead>
                      ))}
                      <TableHead className="w-12">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.items
                      .filter(item => 
                        !filterText || 
                        item.elemento.toLowerCase().includes(filterText.toLowerCase()) ||
                        item.servicos.toLowerCase().includes(filterText.toLowerCase())
                      )
                      .map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedItems([...selectedItems, item.id]);
                                } else {
                                  setSelectedItems(selectedItems.filter(id => id !== item.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <EditableCell
                              value={item.elemento}
                              onSave={(value) => updateClient(item.id, { elemento: value })}
                            />
                          </TableCell>
                          <TableCell>
                            <EditableCell
                              value={item.servicos}
                              onSave={(value) => updateClient(item.id, { servicos: value })}
                            />
                          </TableCell>
                          <TableCell>
                            <EditableCell
                              value={item.informacoes}
                              onSave={(value) => updateClient(item.id, { informacoes: value })}
                            />
                          </TableCell>
                          <TableCell>
                            <EditableCell
                              value={item.observacoes || ''}
                              onSave={(value) => updateClient(item.id, { observacoes: value })}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                id={`file-${item.id}`}
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(item.id, file);
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`file-${item.id}`)?.click()}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              {item.attachments && item.attachments.length > 0 && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-3 w-3" />
                                      {item.attachments.length}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl">
                                    <DialogHeader>
                                      <DialogTitle>Anexos - {item.elemento}</DialogTitle>
                                    </DialogHeader>
                                    <AttachmentViewer files={getClientFiles(item.id)} />
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </TableCell>
                          {customColumns.map(column => (
                            <TableCell key={column.id}>
                              {column.type === 'status' ? (
                                <StatusButton
                                  currentStatus={item[column.id] || ''}
                                  onStatusChange={(statusId) => updateItemStatus(item.id, column.id, statusId)}
                                />
                              ) : (
                                <EditableCell
                                  value={item[column.id] || ''}
                                  onSave={(value) => updateClient(item.id, { [column.id]: value })}
                                />
                              )}
                            </TableCell>
                          ))}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => deleteClient(item.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Deletar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
