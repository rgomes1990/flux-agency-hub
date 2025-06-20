
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { useUsersData } from '@/hooks/useUsersData';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function Users() {
  const { users, addUser, updateUser, deleteUser } = useUsersData();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleCreateUser = () => {
    if (!newUsername.trim() || !newPassword.trim()) return;
    
    addUser(newUsername, newPassword);
    setNewUsername('');
    setNewPassword('');
    setShowCreateDialog(false);
  };

  const startEditing = (user: any) => {
    setEditingUser(user.id);
    setEditUsername(user.username);
    setEditPassword(user.password);
  };

  const handleUpdateUser = () => {
    if (!editingUser || !editUsername.trim() || !editPassword.trim()) return;
    
    updateUser(editingUser, {
      username: editUsername,
      password: editPassword
    });
    
    setEditingUser(null);
    setEditUsername('');
    setEditPassword('');
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
    setConfirmDelete(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários do Sistema</h1>
          <p className="text-gray-600 mt-1">Gerencie os usuários com acesso ao sistema</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nome de usuário"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div className="flex space-x-2">
                <Button onClick={handleCreateUser} className="bg-orange-600 hover:bg-orange-700">
                  Criar
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-lg">{user.username}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditing(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDelete(user.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome de usuário"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Senha"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
            />
            <div className="flex space-x-2">
              <Button onClick={handleUpdateUser} className="bg-orange-600 hover:bg-orange-700">
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDeleteUser(confirmDelete)}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        confirmText="Excluir"
      />
    </div>
  );
}
