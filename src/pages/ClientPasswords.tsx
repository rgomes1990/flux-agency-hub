import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, Lock, Eye, EyeOff } from 'lucide-react';
import { useClientPasswordsData } from '@/hooks/useClientPasswordsData';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function ClientPasswords() {
  const { passwords, addPassword, updatePassword, deletePassword } = useClientPasswordsData();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPassword, setEditingPassword] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Estados para formulário
  const [formData, setFormData] = useState({
    clientName: '',
    platform: '',
    login: '',
    password: ''
  });

  const [editFormData, setEditFormData] = useState({
    clientName: '',
    platform: '',
    login: '',
    password: ''
  });

  const handleCreatePassword = () => {
    if (!formData.clientName.trim() || !formData.platform.trim() || 
        !formData.login.trim() || !formData.password.trim()) return;
    
    addPassword(formData.clientName, formData.platform, formData.login, formData.password);
    setFormData({ clientName: '', platform: '', login: '', password: '' });
    setShowCreateDialog(false);
  };

  const startEditing = (passwordItem: any) => {
    setEditingPassword(passwordItem.id);
    setEditFormData({
      clientName: passwordItem.clientName,
      platform: passwordItem.platform,
      login: passwordItem.login,
      password: passwordItem.password
    });
  };

  const handleUpdatePassword = () => {
    if (!editingPassword || !editFormData.clientName.trim() || 
        !editFormData.platform.trim() || !editFormData.login.trim() || 
        !editFormData.password.trim()) return;
    
    updatePassword(editingPassword, editFormData);
    setEditingPassword(null);
    setEditFormData({ clientName: '', platform: '', login: '', password: '' });
  };

  const handleDeletePassword = (passwordId: string) => {
    deletePassword(passwordId);
    setConfirmDelete(null);
  };

  const togglePasswordVisibility = (passwordId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [passwordId]: !prev[passwordId]
    }));
  };

  const filteredPasswords = passwords.filter(password =>
    password.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.platform.toLowerCase().includes(searchTerm.toLowerCase())
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
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              />
              <Input
                placeholder="Plataforma (ex: Facebook, Google Ads)"
                value={formData.platform}
                onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
              />
              <Input
                placeholder="Login/Email"
                value={formData.login}
                onChange={(e) => setFormData(prev => ({ ...prev, login: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Senha"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
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
                  <CardTitle className="text-lg">{passwordItem.clientName}</CardTitle>
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
                <p className="text-sm text-gray-600">{passwordItem.platform}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Login:</p>
                <p className="text-sm text-gray-600">{passwordItem.login}</p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">Senha:</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => togglePasswordVisibility(passwordItem.id)}
                  >
                    {showPasswords[passwordItem.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 font-mono">
                  {showPasswords[passwordItem.id] ? passwordItem.password : '•'.repeat(passwordItem.password.length)}
                </p>
              </div>
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
              value={editFormData.clientName}
              onChange={(e) => setEditFormData(prev => ({ ...prev, clientName: e.target.value }))}
            />
            <Input
              placeholder="Plataforma"
              value={editFormData.platform}
              onChange={(e) => setEditFormData(prev => ({ ...prev, platform: e.target.value }))}
            />
            <Input
              placeholder="Login/Email"
              value={editFormData.login}
              onChange={(e) => setEditFormData(prev => ({ ...prev, login: e.target.value }))}
            />
            <Input
              type="password"
              placeholder="Senha"
              value={editFormData.password}
              onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
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
