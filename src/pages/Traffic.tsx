import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Copy,
  Settings,
  Trash2,
  Paperclip,
  Eye
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTrafficData } from '@/hooks/useTrafficData';
import { StatusButton } from '@/components/ServiceManagement/StatusButton';
import { CustomStatusModal } from '@/components/ServiceManagement/CustomStatusModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { FilePreview } from '@/components/FilePreview';

export default function Traffic() {
  const { 
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
    updateColumn,
    deleteColumn,
    updateItemStatus,
    addClient,
    deleteClient,
    updateClient
  } = useTrafficData();
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [newMonthName, setNewMonthName] = useState('');
  const [duplicateMonthName, setDuplicateMonthName] = useState('');
  const [selectedGroupToDuplicate, setSelectedGroupToDuplicate] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState<string | null>(null);
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientServices, setNewClientServices] = useState('');
  const [selectedGroupForClient, setSelectedGroupForClient] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [clientFile, setClientFile] = useState<File | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<'status' | 'text'>('status');
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'client' | 'column', id: string } | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);

  const toggleGroup = (groupId: string) => {
    updateGroups(groups.map(group => 
      group.id === groupId 
        ? { ...group, isExpanded: !group.isExpanded }
        : group
    ));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = groups.flatMap(group => group.items.map(item => item.id));
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleCreateMonth = () => {
    if (!newMonthName.trim()) return;
    
    createMonth(newMonthName);
    setNewMonthName('');
    setShowCreateDialog(false);
  };

  const handleDuplicateMonth = () => {
    if (!duplicateMonthName.trim() || !selectedGroupToDuplicate) return;
    
    duplicateMonth(selectedGroupToDuplicate, duplicateMonthName);
    setDuplicateMonthName('');
    setSelectedGroupToDuplicate('');
    setShowDuplicateDialog(false);
  };

  const handleCreateClient = () => {
    if (!newClientName.trim() || !selectedGroupForClient) return;
    
    addClient(selectedGroupForClient, {
      elemento: newClientName,
      servicos: newClientServices
    });
    
    setNewClientName('');
    setNewClientServices('');
    setSelectedGroupForClient('');
    setShowClientDialog(false);
  };

  const handleCreateColumn = () => {
    if (!newColumnName.trim()) return;
    
    addColumn(newColumnName, newColumnType);
    setNewColumnName('');
    setNewColumnType('status');
    setShowColumnDialog(false);
  };

  const handleDeleteClient = (clientId: string) => {
    deleteClient(clientId);
    setConfirmDelete(null);
  };

  const handleDeleteColumn = (columnId: string) => {
    deleteColumn(columnId);
    setConfirmDelete(null);
  };

  const openClientDetails = (clientId: string) => {
    const client = groups.flatMap(g => g.items).find(item => item.id === clientId);
    if (client) {
      setClientNotes(client.observacoes || '');
      setClientFile(client.attachments?.[0] || null);
      setShowClientDetails(clientId);
    }
  };

  const saveClientDetails = () => {
    if (showClientDetails) {
      const updates: any = { observacoes: clientNotes };
      
      if (clientFile) {
        updates.attachments = [clientFile];
      }
      
      updateClient(showClientDetails, updates);
    }
    setShowClientDetails(null);
    setClientNotes('');
    setClientFile(null);
  };

  const openFilePreview = (file: File) => {
    setPreviewFile(file);
    setShowFilePreview(true);
  };

  const getClientAttachments = (clientId: string) => {
    const client = groups.flatMap(g => g.items).find(item => item.id === clientId);
    return client?.attachments || [];
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900">Tráfego Pago</h1>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center space-x-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Criar mês
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Mês</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome do mês"
                  value={newMonthName}
                  onChange={(e) => setNewMonthName(e.target.value)}
                />
                <div className="flex space-x-2">
                  <Button onClick={handleCreateMonth} className="bg-orange-600 hover:bg-orange-700">
                    Criar
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-1" />
                Duplicar mês
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {groups.map((group) => (
                <DropdownMenuItem
                  key={group.id}
                  onClick={() => {
                    setSelectedGroupToDuplicate(group.id);
                    setShowDuplicateDialog(true);
                  }}
                >
                  Duplicar {group.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowClientDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo Cliente
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowColumnDialog(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Gerenciar Colunas
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowStatusModal(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Gerenciar Status
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-full">
          {/* Table Header */}
          <div className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
            <div className="flex items-center min-w-max">
              <div className="w-8 flex items-center justify-center p-2">
                <Checkbox
                  checked={selectedItems.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </div>
              <div className="w-48 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Cliente</div>
              <div className="w-36 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Serviços</div>
              {columns.map((column) => (
                <div key={column.id} className="w-32 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">
                  {column.name}
                </div>
              ))}
              <div className="w-20 p-2 text-xs font-medium text-gray-600">Ações</div>
            </div>
          </div>

          {/* Table Body */}
          {groups.map((group) => (
            <div key={group.id}>
              {/* Group Header */}
              <div 
                className="bg-orange-50 border-b border-gray-200 cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => toggleGroup(group.id)}
              >
                <div className="flex items-center min-w-max">
                  <div className="w-8 flex items-center justify-center p-2">
                    {group.isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 p-2">
                    <div className={`w-3 h-3 rounded ${group.color}`}></div>
                    <span className="font-medium text-gray-900">{group.name}</span>
                  </div>
                </div>
              </div>

              {/* Group Items */}
              {group.isExpanded && group.items.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center min-w-max">
                    <div className="w-8 flex items-center justify-center p-2">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                      />
                    </div>
                    <div className="w-48 p-2 border-r border-gray-200">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openClientDetails(item.id)}
                          className="text-sm text-blue-600 hover:underline font-medium text-left"
                        >
                          {item.elemento}
                        </button>
                        {getClientAttachments(item.id).length > 0 && (
                          <Paperclip className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="w-36 p-2 text-sm text-gray-600 border-r border-gray-200">
                      {item.servicos}
                    </div>
                    {columns.map((column) => (
                      <div key={column.id} className="w-32 p-2 border-r border-gray-200">
                        {column.type === 'status' ? (
                          <StatusButton
                            currentStatus={(item as any)[column.id] || ''}
                            statuses={statuses}
                            onStatusChange={(statusId) => updateItemStatus(item.id, column.id, statusId)}
                          />
                        ) : (
                          <Input
                            value={(item as any)[column.id] || ''}
                            onChange={(e) => updateClient(item.id, { [column.id]: e.target.value })}
                            className="border-0 bg-transparent p-0 h-auto"
                            placeholder="..."
                          />
                        )}
                      </div>
                    ))}
                    <div className="w-20 p-2 flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDelete({ type: 'client', id: item.id })}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar Mês</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome do novo mês"
              value={duplicateMonthName}
              onChange={(e) => setDuplicateMonthName(e.target.value)}
            />
            <div className="flex space-x-2">
              <Button onClick={handleDuplicateMonth} className="bg-orange-600 hover:bg-orange-700">
                Duplicar
              </Button>
              <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome do cliente"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
            />
            <Input
              placeholder="Serviços (ex: Campanha Google Ads)"
              value={newClientServices}
              onChange={(e) => setNewClientServices(e.target.value)}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Mês</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={selectedGroupForClient}
                onChange={(e) => setSelectedGroupForClient(e.target.value)}
              >
                <option value="">Selecione um mês</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateClient} className="bg-orange-600 hover:bg-orange-700">
                Criar
              </Button>
              <Button variant="outline" onClick={() => setShowClientDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Colunas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome da coluna"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo da Coluna</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={newColumnType}
                onChange={(e) => setNewColumnType(e.target.value as 'status' | 'text')}
              >
                <option value="status">Status (com cores)</option>
                <option value="text">Texto livre</option>
              </select>
            </div>
            <Button onClick={handleCreateColumn} className="w-full bg-orange-600 hover:bg-orange-700">
              Criar Coluna
            </Button>
            
            <div className="space-y-2">
              <h4 className="font-medium">Colunas Existentes:</h4>
              {columns.map(column => (
                <div key={column.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">
                    {column.name} ({column.type}) {column.isDefault && '(Padrão)'}
                  </span>
                  {!column.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmDelete({ type: 'column', id: column.id })}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showClientDetails} onOpenChange={(open) => !open && setShowClientDetails(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {showClientDetails && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Observações</label>
                <Textarea
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Adicione suas observações..."
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Anexar Arquivo</label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="file"
                    onChange={(e) => setClientFile(e.target.files?.[0] || null)}
                    className="text-sm"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  />
                  <Paperclip className="h-4 w-4 text-gray-400" />
                </div>
                {clientFile && (
                  <div className="mt-2 p-2 border rounded flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm truncate">{clientFile.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openFilePreview(clientFile)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {/* Show existing attachments */}
                {getClientAttachments(showClientDetails).length > 0 && !clientFile && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-2">Arquivos anexados:</p>
                    {getClientAttachments(showClientDetails).map((file, index) => (
                      <div key={index} className="p-2 border rounded flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openFilePreview(file)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={saveClientDetails}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setShowClientDetails(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CustomStatusModal
        open={showStatusModal}
        onOpenChange={setShowStatusModal}
        onAddStatus={addStatus}
        onUpdateStatus={updateStatus}
        onDeleteStatus={deleteStatus}
        existingStatuses={statuses}
      />

      <FilePreview
        file={previewFile}
        open={showFilePreview}
        onOpenChange={setShowFilePreview}
      />

      <ConfirmationDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete?.type === 'client') {
            handleDeleteClient(confirmDelete.id);
          } else if (confirmDelete?.type === 'column') {
            handleDeleteColumn(confirmDelete.id);
          }
        }}
        title="Confirmar Exclusão"
        message={
          confirmDelete?.type === 'client' 
            ? "Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
            : "Tem certeza que deseja excluir esta coluna? Esta ação não pode ser desfeita."
        }
        confirmText="Excluir"
      />
    </div>
  );
}
