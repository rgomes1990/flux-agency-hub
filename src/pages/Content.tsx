
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, Eye, Paperclip, FileText } from 'lucide-react';
import { useContentData } from '@/hooks/useContentData';
import { FilePreview } from '@/components/FilePreview';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Content() {
  const { data, addData, updateData, deleteData, duplicateMonth, getClients, getMonths } = useContentData();
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [formData, setFormData] = useState({
    cliente: '',
    mes: '',
    tipoConteudo: '',
    plataforma: '',
    status: 'planejado',
    dataPublicacao: '',
    observacoes: '',
    attachments: [] as File[]
  });

  const months = getMonths();
  const clients = getClients();
  const statuses = ['planejado', 'em_producao', 'revisao', 'aprovado', 'publicado'];

  const resetForm = () => {
    setFormData({
      cliente: '',
      mes: '',
      tipoConteudo: '',
      plataforma: '',
      status: 'planejado',
      dataPublicacao: '',
      observacoes: '',
      attachments: []
    });
    setEditingContent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingContent) {
      updateData(editingContent, formData);
    } else {
      addData(formData);
    }
    
    resetForm();
    setShowModal(false);
  };

  const handleEdit = (content: any) => {
    setEditingContent(content.id);
    setFormData({
      cliente: content.cliente,
      mes: content.mes,
      tipoConteudo: content.tipoConteudo,
      plataforma: content.plataforma,
      status: content.status,
      dataPublicacao: content.dataPublicacao || '',
      observacoes: content.observacoes || '',
      attachments: content.attachments || []
    });
    setShowModal(true);
  };

  const handleDelete = (contentId: string) => {
    if (confirm('Tem certeza que deseja excluir este conteúdo?')) {
      deleteData(contentId);
    }
  };

  const handleDuplicateMonth = (mes: string) => {
    if (confirm(`Tem certeza que deseja duplicar o mês ${mes}?`)) {
      duplicateMonth(mes);
    }
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

  const getStatusColor = (status: string) => {
    const colors = {
      planejado: 'bg-gray-100 text-gray-800',
      em_producao: 'bg-blue-100 text-blue-800',
      revisao: 'bg-yellow-100 text-yellow-800',
      aprovado: 'bg-green-100 text-green-800',
      publicado: 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredData = data.filter(item => {
    const monthMatch = !selectedMonth || item.mes === selectedMonth;
    const clientMatch = !selectedClient || item.cliente === selectedClient;
    return monthMatch && clientMatch;
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gestão de Conteúdo
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setShowModal(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Conteúdo
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <Label>Filtrar por Mês</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os meses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os meses</SelectItem>
                  {months.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Filtrar por Cliente</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os clientes</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client} value={client}>{client}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMonth && (
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDuplicateMonth(selectedMonth)}
                >
                  Duplicar Mês
                </Button>
              </div>
            )}
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-left p-3">Mês</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Plataforma</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Data Pub.</th>
                  <th className="text-left p-3">Anexos</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((content) => (
                  <tr key={content.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{content.cliente}</td>
                    <td className="p-3">{content.mes}</td>
                    <td className="p-3">{content.tipoConteudo}</td>
                    <td className="p-3">
                      <Badge variant="outline">{content.plataforma}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(content.status)}>
                        {content.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {content.dataPublicacao ? 
                        format(new Date(content.dataPublicacao), 'dd/MM/yyyy', { locale: ptBR }) : 
                        '-'
                      }
                    </td>
                    <td className="p-3">
                      {content.attachments && content.attachments.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {content.attachments.map((file, index) => (
                            <button
                              key={index}
                              onClick={() => openFilePreview(file)}
                              className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                            >
                              <Paperclip className="h-3 w-3" />
                              {file.name.length > 10 ? `${file.name.substring(0, 10)}...` : file.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(content)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(content.id)}
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

            {filteredData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum conteúdo encontrado.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? 'Editar Conteúdo' : 'Novo Conteúdo'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Label htmlFor="mes">Mês *</Label>
                <Input
                  id="mes"
                  type="month"
                  value={formData.mes}
                  onChange={(e) => setFormData(prev => ({ ...prev, mes: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tipoConteudo">Tipo de Conteúdo *</Label>
                <Input
                  id="tipoConteudo"
                  value={formData.tipoConteudo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipoConteudo: e.target.value }))}
                  required
                  placeholder="Ex: Post, Story, Reel"
                />
              </div>

              <div>
                <Label htmlFor="plataforma">Plataforma *</Label>
                <Input
                  id="plataforma"
                  value={formData.plataforma}
                  onChange={(e) => setFormData(prev => ({ ...prev, plataforma: e.target.value }))}
                  required
                  placeholder="Ex: Instagram, Facebook"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dataPublicacao">Data de Publicação</Label>
                <Input
                  id="dataPublicacao"
                  type="date"
                  value={formData.dataPublicacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, dataPublicacao: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações sobre o conteúdo..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="attachments">Anexos</Label>
              <input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full text-sm"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              />
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

            <div className="flex justify-end gap-2 pt-4">
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

      <FilePreview
        file={previewFile}
        open={showFilePreview}
        onOpenChange={setShowFilePreview}
      />
    </div>
  );
}
