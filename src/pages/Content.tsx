
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
  Edit,
  Trash2,
  Paperclip,
  Eye
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useContentData } from '@/hooks/useContentData';
import { StatusButton } from '@/components/ServiceManagement/StatusButton';
import { CustomStatusModal } from '@/components/ServiceManagement/CustomStatusModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { FilePreview } from '@/components/FilePreview';

export default function Content() {
  const { 
    groups, 
    statuses,
    updateGroups, 
    createMonth, 
    duplicateMonth,
    addStatus,
    updateItemStatus,
    addClient,
    deleteClient,
    updateClient
  } = useContentData();
  
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
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'client', id: string } | null>(null);
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
    
    // Close dialog first to prevent freezing
    setShowDuplicateDialog(false);
    
    // Use setTimeout to prevent blocking the UI
    setTimeout(() => {
      duplicateMonth(selectedGroupToDuplicate, duplicateMonthName);
      setDuplicateMonthName('');
      setSelectedGroupToDuplicate('');
    }, 100);
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

  const handleDeleteClient = (clientId: string) => {
    deleteClient(clientId);
    setConfirmDelete(null);
  };

  const openClientDetails = (clientId: string) => {
    const client = groups.flatMap(g => g.items).find(item => item.id === clientId);
    if (client) {
      setClientNotes(client.observacoes || '');
      setShowClientDetails(clientId);
    }
  };

  const openFilePreview = (file: File) => {
    setPreviewFile(file);
    setShowFilePreview(true);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900">Criação Conteúdo</h1>
          </div>
        </div>
      </div>

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
              <div className="w-28 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Títulos</div>
              <div className="w-28 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Textos</div>
              <div className="w-28 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Artes</div>
              <div className="w-32 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Postagem</div>
              <div className="w-32 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Roteiro de Vídeos</div>
              <div className="w-28 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Captação</div>
              <div className="w-32 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Edição de Vídeo</div>
              <div className="w-48 p-2 text-xs font-medium text-gray-600 border-r border-gray-300">Informações</div>
              <div className="w-20 p-2 text-xs font-medium text-gray-600">Ações</div>
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.id}>
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
                      <button
                        onClick={() => openClientDetails(item.id)}
                        className="text-sm text-blue-600 hover:underline font-medium text-left w-full"
                      >
                        {item.elemento}
                      </button>
                    </div>
                    <div className="w-36 p-2 text-sm text-gray-600 border-r border-gray-200">
                      {item.servicos}
                    </div>
                    <div className="w-28 p-2 border-r border-gray-200">
                      <StatusButton
                        currentStatus={item.titulos}
                        statuses={statuses}
                        onStatusChange={(statusId) => updateItemStatus(item.id, 'titulos', statusId)}
                      />
                    </div>
                    <div className="w-28 p-2 border-r border-gray-200">
                      <StatusButton
                        currentStatus={item.textos}
                        statuses={statuses}
                        onStatusChange={(statusId) => updateItemStatus(item.id, 'textos', statusId)}
                      />
                    </div>
                    <div className="w-28 p-2 border-r border-gray-200">
                      <StatusButton
                        currentStatus={item.artes}
                        statuses={statuses}
                        onStatusChange={(statusId) => updateItemStatus(item.id, 'artes', statusId)}
                      />
                    </div>
                    <div className="w-32 p-2 border-r border-gray-200">
                      <StatusButton
                        currentStatus={item.postagem}
                        statuses={statuses}
                        onStatusChange={(statusId) => updateItemStatus(item.id, 'postagem', statusId)}
                      />
                    </div>
                    <div className="w-32 p-2 border-r border-gray-200">
                      <StatusButton
                        currentStatus={item.roteiro_videos}
                        statuses={statuses}
                        onStatusChange={(statusId) => updateItemStatus(item.id, 'roteiro_videos', statusId)}
                      />
                    </div>
                    <div className="w-28 p-2 border-r border-gray-200">
                      <StatusButton
                        currentStatus={item.captacao}
                        statuses={statuses}
                        onStatusChange={(statusId) => updateItemStatus(item.id, 'captacao', statusId)}
                      />
                    </div>
                    <div className="w-32 p-2 border-r border-gray-200">
                      <StatusButton
                        currentStatus={item.edicao_video}
                        statuses={statuses}
                        onStatusChange={(statusId) => updateItemStatus(item.id, 'edicao_video', statusId)}
                      />
                    </div>
                    <div className="w-48 p-2 text-sm text-gray-600 border-r border-gray-200">
                      <Input
                        value={item.informacoes}
                        onChange={(e) => updateClient(item.id, { informacoes: e.target.value })}
                        className="border-0 bg-transparent p-0 h-auto"
                        placeholder="Informações..."
                      />
                    </div>
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
              placeholder="Serviços (ex: 12 Artes + Conteúdo)"
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
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => {
                    if (showClientDetails) {
                      updateClient(showClientDetails, { observacoes: clientNotes });
                    }
                    setShowClientDetails(null);
                    setClientNotes('');
                    setClientFile(null);
                  }}
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

      <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Colunas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              As colunas do sistema de conteúdo são fixas. Use o menu "Gerenciar Status" para personalizar os status.
            </p>
            <Button variant="outline" onClick={() => setShowColumnDialog(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CustomStatusModal
        open={showStatusModal}
        onOpenChange={setShowStatusModal}
        onAddStatus={addStatus}
        onAddColumn={() => {}}
      />

      <FilePreview
        file={previewFile}
        open={showFilePreview}
        onOpenChange={setShowFilePreview}
      />

      <ConfirmationDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDeleteClient(confirmDelete.id)}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        confirmText="Excluir"
      />
    </div>
  );
}
