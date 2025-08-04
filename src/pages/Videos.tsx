import { useState } from "react";
import { Plus, Users, Calendar, ChevronDown, ChevronRight, Ellipsis, Settings, Trash2, Eye, Copy, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusButton } from "@/components/ServiceManagement/StatusButton";
import { AddServiceModal } from "@/components/ServiceManagement/AddServiceModal";
import { CustomStatusModal } from "@/components/ServiceManagement/CustomStatusModal";
import { ClientDetails } from "@/components/ClientManagement/ClientDetails";
import { ClientRegistration } from "@/components/ClientManagement/ClientRegistration";
import { FilePreview } from "@/components/FilePreview";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUndoHistory } from "@/hooks/useUndoHistory";
import { useVideosData, VideoItem } from "@/hooks/useVideosData";

export default function Videos() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [showCustomStatusDialog, setShowCustomStatusDialog] = useState(false);
  const [showDeleteColumnDialog, setShowDeleteColumnDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState<string | null>(null);
  const [showDeleteClientDialog, setShowDeleteClientDialog] = useState<string | null>(null);
  const [showClientDetails, setShowClientDetails] = useState<string | null>(null);
  const [showFilePreview, setShowFilePreview] = useState<{ clientId: string, fileName: string } | null>(null);
  const [newMonthName, setNewMonthName] = useState("");
  const [editMonthName, setEditMonthName] = useState("");
  const [duplicateMonthName, setDuplicateMonthName] = useState("");
  const [duplicateSourceId, setDuplicateSourceId] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState<'status' | 'text'>('status');
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  const [clientObservations, setClientObservations] = useState("");

  const isMobile = useIsMobile();
  const { addUndoAction } = useUndoHistory();

  const saveState = (data: any, action: string) => {
    addUndoAction(action, () => {
      console.log('Undo action:', action);
    });
  };

  const {
    groups,
    columns,
    customColumns,
    statuses,
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
    updateGroups,
    updateMonth,
    deleteMonth,
    duplicateMonth
  } = useVideosData();

  const handleToggleGroup = (groupId: string) => {
    const newGroups = groups.map(group => 
      group.id === groupId 
        ? { ...group, isExpanded: !group.isExpanded }
        : group
    );
    updateGroups(newGroups);
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    const allItemIds = groups.flatMap(group => group.items.map(item => item.id));
    setSelectedItems(selectedItems.length === allItemIds.length ? [] : allItemIds);
  };

  const handleCreateMonth = async () => {
    if (!newMonthName.trim()) return;
    
    saveState(groups, 'create-month');
    await createMonth(newMonthName);
    setNewMonthName("");
    setShowCreateDialog(false);
  };

  const handleDuplicateMonth = async () => {
    if (!duplicateMonthName.trim() || !duplicateSourceId) return;
    
    saveState(groups, 'duplicate-month');
    await duplicateMonth(duplicateSourceId, duplicateMonthName);
    setDuplicateMonthName("");
    setDuplicateSourceId("");
    setShowDuplicateDialog(false);
  };

  const handleAddClient = async (clientData: any) => {
    if (!selectedGroupId) return;
    
    saveState(groups, 'add-client');
    await addClient(selectedGroupId, clientData);
    setShowClientDialog(false);
    setSelectedGroupId("");
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;
    
    saveState(groups, 'add-column');
    await addColumn(newColumnName, newColumnType);
    setNewColumnName("");
    setShowColumnDialog(false);
  };

  const handleDeleteColumn = async () => {
    if (!columnToDelete) return;
    
    saveState(groups, 'delete-column');
    await deleteColumn(columnToDelete);
    setColumnToDelete(null);
    setShowDeleteColumnDialog(false);
  };

  const handleEditMonth = async () => {
    if (!editMonthName.trim() || !showEditDialog) return;
    
    saveState(groups, 'edit-month');
    await updateMonth(showEditDialog, editMonthName);
    setEditMonthName("");
    setShowEditDialog(null);
  };

  const handleDeleteMonth = async () => {
    if (!showDeleteDialog) return;
    
    saveState(groups, 'delete-month');
    await deleteMonth(showDeleteDialog);
    setShowDeleteDialog(null);
  };

  const handleDeleteClient = async () => {
    if (!showDeleteClientDialog) return;
    
    saveState(groups, 'delete-client');
    await deleteClient(showDeleteClientDialog);
    setShowDeleteClientDialog(null);
  };

  const handleStatusChange = async (itemId: string, field: string, statusId: string) => {
    saveState(groups, 'status-change');
    await updateItemStatus(itemId, field, statusId);
  };

  const saveClientDetails = async () => {
    if (!showClientDetails) return;
    
    const item = groups.flatMap(g => g.items).find(item => item.id === showClientDetails);
    if (item) {
      await updateClient(showClientDetails, { observacoes: clientObservations });
    }
    setShowClientDetails(null);
  };

  const allColumns = [...columns, ...customColumns.map(col => col.name)];

  if (isMobile) {
    return (
      <div className="p-4">
        <div className="text-center text-muted-foreground">
          A visualização de vídeos não está disponível em dispositivos móveis.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vídeos</h1>
          <p className="text-muted-foreground">Gerencie seus vídeos e campanhas</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Criar Mês
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Mês</DialogTitle>
              <DialogDescription>
                Digite o nome do novo mês para organizar seus vídeos.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Nome do mês"
              value={newMonthName}
              onChange={(e) => setNewMonthName(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateMonth}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Duplicar Mês
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Duplicar Mês</DialogTitle>
              <DialogDescription>
                Selecione um mês para duplicar e digite o nome do novo mês.
              </DialogDescription>
            </DialogHeader>
            <Select value={duplicateSourceId} onValueChange={setDuplicateSourceId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar mês para duplicar" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Nome do novo mês"
              value={duplicateMonthName}
              onChange={(e) => setDuplicateMonthName(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleDuplicateMonth}>Duplicar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Cliente</DialogTitle>
              <DialogDescription>
                Selecione um mês e adicione um novo cliente.
              </DialogDescription>
            </DialogHeader>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar mês" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-4">
              <Input
                placeholder="Nome do cliente"
                value={clientObservations}
                onChange={(e) => setClientObservations(e.target.value)}
              />
              <Button onClick={() => handleAddClient({ elemento: clientObservations })}>
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Coluna
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Coluna</DialogTitle>
              <DialogDescription>
                Crie uma nova coluna para organizar melhor seus dados.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Nome da coluna"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
            />
            <Select value={newColumnType} onValueChange={(value: 'status' | 'text') => setNewColumnType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="text">Texto</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowColumnDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddColumn}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setShowCustomStatusDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Status Personalizados
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setShowDeleteColumnDialog(true)}
              disabled={customColumns.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar Coluna
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedItems.length === groups.flatMap(g => g.items).length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[200px]">Mês</TableHead>
                {allColumns.map((column, index) => (
                  <TableHead key={index} className="min-w-[150px]">
                    {column === 'elemento' ? 'Cliente' : column}
                  </TableHead>
                ))}
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <>
                  <TableRow key={group.id} className="bg-muted/50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleGroup(group.id)}
                      >
                        {group.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className={`inline-block w-3 h-3 rounded-full mr-2 ${group.color}`}></div>
                      {group.name}
                    </TableCell>
                    <TableCell colSpan={allColumns.length}>
                      <span className="text-sm text-muted-foreground">
                        {group.items.length} clientes
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Ellipsis className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => {
                            setShowEditDialog(group.id);
                            setEditMonthName(group.name);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setShowDeleteDialog(group.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {group.isExpanded && group.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                        />
                      </TableCell>
                      <TableCell></TableCell>
                      {allColumns.map((column, index) => (
                        <TableCell key={index}>
                          {column === 'elemento' ? (
                            item[column] || ''
                          ) : customColumns.find(col => col.name === column)?.type === 'status' ? (
                            <StatusButton
                              currentStatus={item[column] || ''}
                              statuses={statuses}
                              onStatusChange={(statusId) => handleStatusChange(item.id, column, statusId)}
                            />
                          ) : (
                            <span>{item[column] || ''}</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Ellipsis className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              setShowClientDetails(item.id);
                              setClientObservations(item.observacoes || '');
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setShowDeleteClientDialog(item.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Dialogs */}
      <Dialog open={!!showEditDialog} onOpenChange={(open) => !open && setShowEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Mês</DialogTitle>
            <DialogDescription>
              Digite o novo nome para o mês.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Nome do mês"
            value={editMonthName}
            onChange={(e) => setEditMonthName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEditMonth}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CustomStatusModal
        open={showCustomStatusDialog}
        onOpenChange={setShowCustomStatusDialog}
        onAddStatus={addStatus}
        onUpdateStatus={updateStatus}
        onDeleteStatus={deleteStatus}
      />

      <Dialog open={showDeleteColumnDialog} onOpenChange={setShowDeleteColumnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Coluna</DialogTitle>
            <DialogDescription>
              Selecione a coluna que deseja deletar.
            </DialogDescription>
          </DialogHeader>
          <Select value={columnToDelete || ''} onValueChange={setColumnToDelete}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar coluna" />
            </SelectTrigger>
            <SelectContent>
              {customColumns.map((column) => (
                <SelectItem key={column.id} value={column.id}>
                  {column.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteColumnDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteColumn}>
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!showDeleteDialog}
        onOpenChange={(open) => !open && setShowDeleteDialog(null)}
        onConfirm={handleDeleteMonth}
        title="Deletar Mês"
        message="Tem certeza que deseja deletar este mês?"
      />

      <ConfirmationDialog
        open={!!showDeleteClientDialog}
        onOpenChange={(open) => !open && setShowDeleteClientDialog(null)}
        onConfirm={handleDeleteClient}
        title="Deletar Cliente"
        message="Tem certeza que deseja deletar este cliente?"
      />

      {showClientDetails && (
        <ClientDetails
          open={!!showClientDetails}
          onOpenChange={(open) => {
            if (!open) {
              saveClientDetails();
            }
          }}
          clientName={groups.flatMap(g => g.items).find(item => item.id === showClientDetails)?.elemento || ''}
          observations={[]}
          onUpdateObservations={() => {}}
          onFileSelect={() => {}}
        />
      )}

      {showFilePreview && (
        <FilePreview
          open={!!showFilePreview}
          onOpenChange={(open) => !open && setShowFilePreview(null)}
          file={null}
        />
      )}
    </div>
  );
}