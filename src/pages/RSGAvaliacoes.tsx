import React, { useState, useEffect } from 'react';
import { Plus, Settings, ChevronDown, ChevronRight, MoreHorizontal, Upload, Eye, X, Copy, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StatusButton } from '@/components/ServiceManagement/StatusButton';
import { CustomStatusModal } from '@/components/ServiceManagement/CustomStatusModal';
import { ClientDetails } from '@/components/ClientManagement/ClientDetails';
import { FilePreview } from '@/components/FilePreview';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import useRSGAvaliacoesData, { RSGAvaliacoesGroup, RSGAvaliacoesItem, RSGAvaliacoesColumn, RSGAvaliacoesStatus } from '@/hooks/useRSGAvaliacoesData';

const MODULE_NAME = 'rsg_avaliacoes';

export default function RSGAvaliacoes() {
  const {
    groups,
    columns,
    statuses,
    isLoading,
    saveData,
    createColumn,
    deleteColumn,
    createStatus,
    deleteStatus,
    updateGroup,
    createGroup,
    duplicateGroup,
    deleteMonth
  } = useRSGAvaliacoesData();

  // Estados locais
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});
  const [selectedMonth, setSelectedMonth] = useState('');
  const [showCreateMonthDialog, setShowCreateMonthDialog] = useState(false);
  const [showDuplicateMonthDialog, setShowDuplicateMonthDialog] = useState(false);
  const [showCreateClientDialog, setShowCreateClientDialog] = useState(false);
  const [showCreateColumnDialog, setShowCreateColumnDialog] = useState(false);
  const [showEditMonthDialog, setShowEditMonthDialog] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  const [newMonthName, setNewMonthName] = useState('');
  const [newMonthColor, setNewMonthColor] = useState('bg-purple-500');
  const [duplicateMonthName, setDuplicateMonthName] = useState('');
  const [editMonthName, setEditMonthName] = useState('');
  const [editMonthColor, setEditMonthColor] = useState('bg-purple-500');
  const [editingGroupId, setEditingGroupId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState('text');
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [clientDetailsData, setClientDetailsData] = useState<any>(null);
  const [deleteGroupId, setDeleteGroupId] = useState('');

  const [localGroups, setLocalGroups] = useState<RSGAvaliacoesGroup[]>([]);

  // Sincronizar dados do hook com estado local
  useEffect(() => {
    if (groups) {
      setLocalGroups([...groups] as RSGAvaliacoesGroup[]);
      // Inicializar estados expandidos
      const expanded: { [key: string]: boolean } = {};
      (groups as RSGAvaliacoesGroup[]).forEach(group => {
        expanded[group.id] = group.isExpanded;
      });
      setExpandedGroups(expanded);
    }
  }, [groups]);

  const toggleGroup = (groupId: string) => {
    const newExpanded = { ...expandedGroups, [groupId]: !expandedGroups[groupId] };
    setExpandedGroups(newExpanded);
    updateGroup(groupId, { isExpanded: newExpanded[groupId] });
  };

  const handleCreateMonth = () => {
    if (newMonthName.trim()) {
      createGroup(newMonthName.trim(), newMonthColor);
      setNewMonthName('');
      setNewMonthColor('bg-purple-500');
      setShowCreateMonthDialog(false);
    }
  };

  const handleDuplicateMonth = async () => {
    if (selectedMonth && duplicateMonthName.trim()) {
      await duplicateGroup(selectedMonth, duplicateMonthName.trim());
      setDuplicateMonthName('');
      setSelectedMonth('');
      setShowDuplicateMonthDialog(false);
    }
  };

  const handleCreateClient = () => {
    if (newClientName.trim() && selectedMonth) {
      const group = localGroups.find(g => g.id === selectedMonth);
      if (group) {
        const newClient: RSGAvaliacoesItem = {
          id: `client_${Date.now()}`,
          nome: newClientName.trim(),
          ...columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {})
        };
        
        const updatedGroups = localGroups.map(g => 
          g.id === selectedMonth 
            ? { ...g, items: [...g.items, newClient] }
            : g
        );
        
        setLocalGroups(updatedGroups);
        saveData(updatedGroups);
        setNewClientName('');
        setShowCreateClientDialog(false);
      }
    }
  };

  const handleCreateColumn = () => {
    if (newColumnName.trim()) {
      createColumn(newColumnName.trim(), newColumnType);
      setNewColumnName('');
      setNewColumnType('text');
      setShowCreateColumnDialog(false);
    }
  };

  const handleDeleteClient = (clientId: string) => {
    const updatedGroups = localGroups.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== clientId)
    }));
    setLocalGroups(updatedGroups);
    saveData(updatedGroups);
  };

  const handleDeleteColumn = (columnId: string) => {
    deleteColumn(columnId);
  };

  const handleEditMonth = (groupId: string) => {
    const group = localGroups.find(g => g.id === groupId);
    if (group) {
      setEditingGroupId(groupId);
      setEditMonthName(group.name);
      setEditMonthColor(group.color);
      setShowEditMonthDialog(true);
    }
  };

  const handleUpdateMonth = () => {
    if (editMonthName.trim() && editingGroupId) {
      updateGroup(editingGroupId, { 
        name: editMonthName.trim(), 
        color: editMonthColor 
      });
      setEditingGroupId('');
      setEditMonthName('');
      setEditMonthColor('bg-purple-500');
      setShowEditMonthDialog(false);
    }
  };

  const handleDeleteMonth = (groupId: string) => {
    setDeleteGroupId(groupId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteMonth = async () => {
    if (deleteGroupId) {
      await deleteMonth(deleteGroupId);
      setDeleteGroupId('');
      setShowDeleteConfirmation(false);
    }
  };

  const openClientDetails = (clientId: string) => {
    // Encontrar o cliente em todos os grupos
    let clientData = null;
    for (const group of localGroups) {
      const client = group.items.find(item => item.id === clientId);
      if (client) {
        clientData = client;
        break;
      }
    }
    setClientDetailsData(clientData);
    setShowClientDetails(true);
  };

  const saveClientDetails = async () => {
    if (clientDetailsData) {
      const updatedGroups = localGroups.map(group => ({
        ...group,
        items: group.items.map(item => 
          item.id === clientDetailsData.id ? clientDetailsData : item
        )
      }));
      setLocalGroups(updatedGroups);
      saveData(updatedGroups);
      setShowClientDetails(false);
    }
  };

  const handleMoveClient = (clientId: string, newGroupId: string) => {
    let clientToMove = null;
    let sourceGroupId = '';
    
    // Encontrar o cliente e o grupo de origem
    for (const group of localGroups) {
      const client = group.items.find(item => item.id === clientId);
      if (client) {
        clientToMove = client;
        sourceGroupId = group.id;
        break;
      }
    }
    
    if (clientToMove && sourceGroupId !== newGroupId) {
      const updatedGroups = localGroups.map(group => {
        if (group.id === sourceGroupId) {
          // Remover do grupo original
          return { ...group, items: group.items.filter(item => item.id !== clientId) };
        } else if (group.id === newGroupId) {
          // Adicionar ao novo grupo
          return { ...group, items: [...group.items, clientToMove] };
        }
        return group;
      });
      
      setLocalGroups(updatedGroups);
      saveData(updatedGroups);
    }
  };

  const openFilePreview = (file: File) => {
    setPreviewFile(file);
    setShowFilePreview(true);
  };

  const updateCellValue = (groupId: string, clientId: string, columnId: string, value: any) => {
    const updatedGroups = localGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          items: group.items.map(item => 
            item.id === clientId 
              ? { ...item, [columnId]: value }
              : item
          )
        };
      }
      return group;
    });
    setLocalGroups(updatedGroups);
    saveData(updatedGroups);
  };

  const handleFileUpload = (groupId: string, clientId: string, columnId: string, files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      updateCellValue(groupId, clientId, columnId, fileArray);
    }
  };

  const colorOptions = [
    { value: 'bg-purple-500', label: 'Roxo' },
    { value: 'bg-blue-500', label: 'Azul' },
    { value: 'bg-green-500', label: 'Verde' },
    { value: 'bg-yellow-500', label: 'Amarelo' },
    { value: 'bg-red-500', label: 'Vermelho' },
    { value: 'bg-pink-500', label: 'Rosa' },
    { value: 'bg-indigo-500', label: 'Índigo' },
    { value: 'bg-gray-500', label: 'Cinza' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RSG Avaliações</h1>
          <p className="text-muted-foreground">
            Gerencie dados e informações de avaliações dos clientes
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-4 bg-card rounded-lg border">
        <Dialog open={showCreateMonthDialog} onOpenChange={setShowCreateMonthDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Criar Mês
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
                  placeholder="Ex: Janeiro 2024"
                />
              </div>
              <div>
                <Label htmlFor="month-color">Cor</Label>
                <Select value={newMonthColor} onValueChange={setNewMonthColor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${color.value}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateMonthDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateMonth}>
                  Criar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showDuplicateMonthDialog} onOpenChange={setShowDuplicateMonthDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Duplicar Mês
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Duplicar Mês</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="source-month">Mês de Origem</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {localGroups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duplicate-name">Nome do Novo Mês</Label>
                <Input
                  id="duplicate-name"
                  value={duplicateMonthName}
                  onChange={(e) => setDuplicateMonthName(e.target.value)}
                  placeholder="Ex: Fevereiro 2024"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDuplicateMonthDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleDuplicateMonth}>
                  Duplicar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showCreateClientDialog} onOpenChange={setShowCreateClientDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Criar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="target-month">Mês de Destino</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {localGroups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="client-name">Nome do Cliente</Label>
                <Input
                  id="client-name"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateClientDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateClient}>
                  Criar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showCreateColumnDialog} onOpenChange={setShowCreateColumnDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Gerenciar Colunas
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerenciar Colunas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Colunas Existentes</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {columns.map(column => (
                    <div key={column.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{column.name} ({column.type})</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteColumn(column.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Label htmlFor="column-name">Nome da Nova Coluna</Label>
                <Input
                  id="column-name"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Nome da coluna"
                />
              </div>
              <div>
                <Label htmlFor="column-type">Tipo da Coluna</Label>
                <Select value={newColumnType} onValueChange={setNewColumnType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="file">Arquivo</SelectItem>
                    <SelectItem value="date">Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateColumnDialog(false)}>
                  Fechar
                </Button>
                <Button onClick={handleCreateColumn}>
                  Adicionar Coluna
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" size="sm" onClick={() => setShowStatusModal(true)}>
          <Settings className="mr-2 h-4 w-4" />
          Gerenciar Status
        </Button>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium min-w-[200px]">Cliente</th>
                {columns.map(column => (
                  <th key={column.id} className="text-left p-3 font-medium min-w-[150px]">
                    {column.name}
                  </th>
                ))}
                <th className="text-left p-3 font-medium w-12">Ações</th>
              </tr>
            </thead>
            <tbody>
              {localGroups.map(group => (
                <React.Fragment key={group.id}>
                  {/* Cabeçalho do Grupo */}
                  <tr className={`${group.color} text-white`}>
                    <td colSpan={columns.length + 2} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleGroup(group.id)}
                            className="h-6 w-6 p-0 text-white hover:bg-white/20"
                          >
                            {expandedGroups[group.id] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <span className="font-medium">
                            {group.name} ({group.items.length} clientes)
                          </span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-white/20">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditMonth(group.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMonth(group.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Itens do Grupo */}
                  {expandedGroups[group.id] && group.items.map(item => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span>{item.nome || 'Cliente sem nome'}</span>
                        </div>
                      </td>
                      {columns.map(column => (
                        <td key={column.id} className="p-3">
                          {column.type === 'status' ? (
                            <StatusButton
                              currentStatus={item[column.id] || ''}
                              statuses={statuses}
                              onStatusChange={(statusId) => 
                                updateCellValue(group.id, item.id, column.id, statusId)
                              }
                            />
                          ) : column.type === 'file' ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                multiple
                                className="hidden"
                                id={`file-${group.id}-${item.id}-${column.id}`}
                                onChange={(e) => handleFileUpload(group.id, item.id, column.id, e.target.files)}
                              />
                              <label
                                htmlFor={`file-${group.id}-${item.id}-${column.id}`}
                                className="cursor-pointer"
                              >
                                <Button variant="outline" size="sm" asChild>
                                  <span>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload
                                  </span>
                                </Button>
                              </label>
                              {item[column.id] && Array.isArray(item[column.id]) && item[column.id].length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openFilePreview(item[column.id][0])}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ) : column.type === 'date' ? (
                            <Input
                              type="date"
                              value={item[column.id] || ''}
                              onChange={(e) => updateCellValue(group.id, item.id, column.id, e.target.value)}
                              className="max-w-[150px]"
                            />
                          ) : (
                            <Input
                              value={item[column.id] || ''}
                              onChange={(e) => updateCellValue(group.id, item.id, column.id, e.target.value)}
                              className="max-w-[200px]"
                            />
                          )}
                        </td>
                      ))}
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openClientDetails(item.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClient(item.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais */}
      <Dialog open={showEditMonthDialog} onOpenChange={setShowEditMonthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Mês</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-month-name">Nome do Mês</Label>
              <Input
                id="edit-month-name"
                value={editMonthName}
                onChange={(e) => setEditMonthName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-month-color">Cor</Label>
              <Select value={editMonthColor} onValueChange={setEditMonthColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map(color => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${color.value}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditMonthDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateMonth}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CustomStatusModal
        open={showStatusModal}
        onOpenChange={setShowStatusModal}
        onAddStatus={(status) => createStatus(status.name, status.color)}
        onDeleteStatus={deleteStatus}
        existingStatuses={statuses}
      />

      <ClientDetails
        open={showClientDetails}
        onOpenChange={setShowClientDetails}
        clientName={clientDetailsData?.nome || ''}
        observations={[]}
        onUpdateObservations={() => {}}
        onFileChange={() => {}}
        onFilePreview={() => {}}
        availableGroups={localGroups.map(g => ({ id: g.id, name: g.name }))}
        currentGroupId=""
        onMoveClient={(groupId) => {
          if (clientDetailsData) {
            handleMoveClient(clientDetailsData.id, groupId);
          }
        }}
      />

      <FilePreview
        open={showFilePreview}
        onOpenChange={setShowFilePreview}
        file={previewFile}
      />

      <ConfirmationDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        onConfirm={confirmDeleteMonth}
        title="Deletar Mês"
        message="Tem certeza que deseja deletar este mês? Esta ação não pode ser desfeita e todos os dados associados serão perdidos."
      />
    </div>
  );
}