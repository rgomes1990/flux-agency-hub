
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, Lock } from 'lucide-react';
import { useClientPasswordsData } from '@/hooks/useClientPasswordsData';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function ClientPasswords() {
  const { passwords, addPassword, updatePassword, deletePassword } = useClientPasswordsData();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPassword, setEditingPassword] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Estados para formulário
  const [formData, setFormData] = useState({
    cliente: '',
    plataforma: '',
    observacoes: ''
  });

  const [editFormData, setEditFormData] = useState({
    cliente: '',
    plataforma: '',
    observacoes: ''
  });

  const handleCreatePassword = () => {
    if (!formData.cliente.trim() || !formData.plataforma.trim()) return;
    
    addPassword(formData);
    setFormData({ cliente: '', plataforma: '', observacoes: '' });
    setShowCreateDialog(false);
  };

  const startEditing = (passwordItem: any) => {
    setEditingPassword(passwordItem.id);
    setEditFormData({
      cliente: passwordItem.cliente,
      plataforma: passwordItem.plataforma,
      observacoes: passwordItem.observacoes || ''
    });
  };

  const handleUpdatePassword = () => {
    if (!editingPassword || !editFormData.cliente.trim() || 
        !editFormData.plataforma.trim()) return;
    
    updatePassword(editingPassword, editFormData);
    setEditingPassword(null);
    setEditFormData({ cliente: '', plataforma: '', observacoes: '' });
  };

  const handleDeletePassword = (passwordId: string) => {
    deletePassword(passwordId);
    setConfirmDelete(null);
  };

  const filteredPasswords = passwords.filter(password =>
    password.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.plataforma.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Senhas dos Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie as credenciais de acesso dos seus clientes</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Senha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Senha</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nome do Cliente"
                value={formData.cliente}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
              />
              <Textarea
                placeholder="Plataforma/Serviço (ex: Facebook Ads, Google Analytics, Website, etc.)"
                value={formData.plataforma}
                onChange={(e) => setFormData(prev => ({ ...prev, plataforma: e.target.value }))}
                rows={3}
              />
              <Textarea
                placeholder="Observações (opcional)"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                rows={3}
              />
              <div className="flex space-x-2">
                <Button onClick={handleCreatePassword} className="bg-orange-600 hover:bg-orange-700">
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por cliente ou plataforma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPasswords.map((passwordItem) => (
          <Card key={passwordItem.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-lg">{passwordItem.cliente}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditing(passwordItem)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDelete(passwordItem.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Plataforma:</p>
                <p className="text-sm text-gray-600">{passwordItem.plataforma}</p>
              </div>
              {passwordItem.observacoes && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Observações:</p>
                  <p className="text-sm text-gray-600">{passwordItem.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingPassword} onOpenChange={(open) => !open && setEditingPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome do Cliente"
              value={editFormData.cliente}
              onChange={(e) => setEditFormData(prev => ({ ...prev, cliente: e.target.value }))}
            />
            <Textarea
              placeholder="Plataforma/Serviço"
              value={editFormData.plataforma}
              onChange={(e) => setEditFormData(prev => ({ ...prev, plataforma: e.target.value }))}
              rows={3}
            />
            <Textarea
              placeholder="Observações (opcional)"
              value={editFormData.observacoes}
              onChange={(e) => setEditFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              rows={3}
            />
            <div className="flex space-x-2">
              <Button onClick={handleUpdatePassword} className="bg-orange-600 hover:bg-orange-700">
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setEditingPassword(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDeletePassword(confirmDelete)}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta senha? Esta ação não pode ser desfeita."
        confirmText="Excluir"
      />
    </div>
  );
}
