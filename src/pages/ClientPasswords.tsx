
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Eye, EyeOff, Shield, Paperclip } from 'lucide-react';
import { useClientPasswordsData } from '@/hooks/useClientPasswordsData';
import { FilePreview } from '@/components/FilePreview';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ClientPasswords() {
  const { passwords, addPassword, updatePassword, deletePassword } = useClientPasswordsData();
  const [showModal, setShowModal] = useState(false);
  const [editingPassword, setEditingPassword] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [formData, setFormData] = useState({
    cliente: '',
    plataforma: '',
    observacoes: '',
    attachments: [] as File[]
  });

  const resetForm = () => {
    setFormData({
      cliente: '',
      plataforma: '',
      observacoes: '',
      attachments: []
    });
    setEditingPassword(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPassword) {
      await updatePassword(editingPassword, formData);
    } else {
      await addPassword(formData);
    }
    
    resetForm();
    setShowModal(false);
  };

  const handleEdit = (password: any) => {
    setEditingPassword(password.id);
    setFormData({
      cliente: password.cliente,
      plataforma: password.plataforma,
      observacoes: password.observacoes || '',
      attachments: password.attachments || []
    });
    setShowModal(true);
  };

  const handleDelete = async (passwordId: string) => {
    if (confirm('Tem certeza que deseja excluir esta senha?')) {
      await deletePassword(passwordId);
    }
  };

  const togglePasswordVisibility = (passwordId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [passwordId]: !prev[passwordId]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        attachments: Array.from(e.target.files!)
      }));
    }
  };

  const openFilePreview = (file: File) => {
    setPreviewFile(file);
    setShowFilePreview(true);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Senhas dos Clientes
            </CardTitle>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Senha
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-left p-3">Plataforma</th>
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Anexos</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {passwords.map((password) => (
                  <tr key={password.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{password.cliente}</div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{password.plataforma}</Badge>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {format(new Date(password.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="p-3">
                      {password.attachments && password.attachments.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {password.attachments.map((file, index) => (
                            <button
                              key={index}
                              onClick={() => openFilePreview(file)}
                              className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                            >
                              <Paperclip className="h-3 w-3" />
                              {file.name.length > 15 ? `${file.name.substring(0, 15)}...` : file.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Nenhum</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(password)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(password.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {passwords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma senha cadastrada ainda.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPassword ? 'Editar Senha' : 'Nova Senha'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cliente">Cliente *</Label>
                <Input
                  id="cliente"
                  value={formData.cliente}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                  required
                  placeholder="Nome do cliente"
                />
              </div>
              
              <div>
                <Label htmlFor="plataforma">Plataforma *</Label>
                <Input
                  id="plataforma"
                  value={formData.plataforma}
                  onChange={(e) => setFormData(prev => ({ ...prev, plataforma: e.target.value }))}
                  required
                  placeholder="Ex: Instagram, Facebook, Google Ads"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Informações adicionais sobre a senha..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="attachments">Anexos</Label>
              <div className="flex items-center space-x-2">
                <input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="text-sm"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                />
                <Paperclip className="h-4 w-4 text-gray-400" />
              </div>
              {formData.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <Paperclip className="h-3 w-3" />
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingPassword ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <FilePreview
        file={previewFile}
        open={showFilePreview}
        onOpenChange={setShowFilePreview}
      />
    </div>
  );
}
