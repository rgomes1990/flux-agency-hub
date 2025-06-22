
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useContentData, ContentData } from '@/hooks/useContentData';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function Content() {
  const { data, addData, updateData, deleteData, duplicateMonth, getClients, getMonths } = useContentData();
  
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [formData, setFormData] = useState({
    cliente: '',
    mes: '',
    tipoConteudo: '',
    plataforma: '',
    status: 'planejado',
    dataPublicacao: '',
    observacoes: ''
  });

  const resetForm = () => {
    setFormData({
      cliente: '',
      mes: '',
      tipoConteudo: '',
      plataforma: '',
      status: 'planejado',
      dataPublicacao: '',
      observacoes: ''
    });
    setEditingContent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingContent) {
      updateData(editingContent, formData);
    } else {
      addData(formData);
    }
    
    resetForm();
    setShowModal(false);
  };

  const handleEdit = (content: ContentData) => {
    setEditingContent(content.id);
    setFormData({
      cliente: content.cliente,
      mes: content.mes,
      tipoConteudo: content.tipoConteudo,
      plataforma: content.plataforma,
      status: content.status,
      dataPublicacao: content.dataPublicacao || '',
      observacoes: content.observacoes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (contentId: string) => {
    deleteData(contentId);
    setConfirmDelete(null);
  };

  const handleDuplicateMonth = () => {
    if (selectedMonth) {
      duplicateMonth(selectedMonth);
      setSelectedMonth('');
    }
  };

  const clients = getClients();
  const months = getMonths();
  
  // Group data by month
  const groupedData = months.reduce((acc: { [key: string]: ContentData[] }, month) => {
    acc[month] = data.filter(item => item.mes === month);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Criação de Conteúdo
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Conteúdo
              </Button>
              <div className="flex gap-2">
                <select 
                  className="px-3 py-2 border rounded-md"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="">Selecionar mês para duplicar</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
                <Button 
                  onClick={handleDuplicateMonth} 
                  disabled={!selectedMonth}
                  variant="outline"
                >
                  Duplicar Mês
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {months.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum conteúdo cadastrado ainda.
            </div>
          ) : (
            <div className="space-y-6">
              {months.map(month => (
                <div key={month} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-orange-600">
                    {month} ({groupedData[month]?.length || 0} itens)
                  </h3>
                  
                  {groupedData[month]?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Cliente</th>
                            <th className="text-left p-3">Tipo</th>
                            <th className="text-left p-3">Plataforma</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Data Publicação</th>
                            <th className="text-left p-3">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedData[month].map((content) => (
                            <tr key={content.id} className="border-b hover:bg-gray-50">
                              <td className="p-3 font-medium">{content.cliente}</td>
                              <td className="p-3">{content.tipoConteudo}</td>
                              <td className="p-3">{content.plataforma}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  content.status === 'publicado' ? 'bg-green-100 text-green-800' :
                                  content.status === 'em-producao' ? 'bg-yellow-100 text-yellow-800' :
                                  content.status === 'aprovado' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {content.status}
                                </span>
                              </td>
                              <td className="p-3">{content.dataPublicacao || '-'}</td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(content)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setConfirmDelete(content.id)}
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
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Nenhum conteúdo para este mês.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? 'Editar Conteúdo' : 'Novo Conteúdo'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Cliente *</label>
                <Input
                  value={formData.cliente}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                  required
                  placeholder="Nome do cliente"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Mês *</label>
                <Input
                  type="month"
                  value={formData.mes}
                  onChange={(e) => setFormData(prev => ({ ...prev, mes: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tipo de Conteúdo *</label>
                <Input
                  value={formData.tipoConteudo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipoConteudo: e.target.value }))}
                  required
                  placeholder="Ex: Post, Story, Vídeo"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Plataforma *</label>
                <Input
                  value={formData.plataforma}
                  onChange={(e) => setFormData(prev => ({ ...prev, plataforma: e.target.value }))}
                  required
                  placeholder="Ex: Instagram, Facebook"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="planejado">Planejado</option>
                  <option value="em-producao">Em Produção</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="publicado">Publicado</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Data de Publicação</label>
                <Input
                  type="date"
                  value={formData.dataPublicacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, dataPublicacao: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Observações</label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações adicionais..."
                rows={3}
              />
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
                {editingContent ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este conteúdo? Esta ação não pode ser desfeita."
        confirmText="Excluir"
      />
    </div>
  );
}
