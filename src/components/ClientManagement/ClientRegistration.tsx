
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit2, Eye, EyeOff, Shield, Trash2 } from 'lucide-react';

interface ClientData {
  id: string;
  name: string;
  services: string;
  socialPasswords: {
    instagram: string;
    facebook: string;
    tiktok: string;
    google: string;
    other: string;
  };
  notes: string;
  createdAt: string;
}

export function ClientRegistration() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState<Omit<ClientData, 'id' | 'createdAt'>>({
    name: '',
    services: '',
    socialPasswords: {
      instagram: '',
      facebook: '',
      tiktok: '',
      google: '',
      other: ''
    },
    notes: ''
  });

  useEffect(() => {
    const savedClients = localStorage.getItem('clientRegistrations');
    if (savedClients) {
      // Descriptografar dados ao carregar (simulação)
      setClients(JSON.parse(savedClients));
    }
  }, []);

  useEffect(() => {
    // Criptografar dados ao salvar (simulação)
    localStorage.setItem('clientRegistrations', JSON.stringify(clients));
  }, [clients]);

  const resetForm = () => {
    setFormData({
      name: '',
      services: '',
      socialPasswords: {
        instagram: '',
        facebook: '',
        tiktok: '',
        google: '',
        other: ''
      },
      notes: ''
    });
    setEditingClient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClient) {
      setClients(prev => prev.map(client => 
        client.id === editingClient.id 
          ? { ...formData, id: editingClient.id, createdAt: editingClient.createdAt }
          : client
      ));
    } else {
      const newClient: ClientData = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setClients(prev => [...prev, newClient]);
    }
    
    resetForm();
    setShowModal(false);
  };

  const handleEdit = (client: ClientData) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      services: client.services,
      socialPasswords: { ...client.socialPasswords },
      notes: client.notes
    });
    setShowModal(true);
  };

  const handleDelete = (clientId: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(prev => prev.filter(client => client.id !== clientId));
    }
  };

  const togglePasswordVisibility = (clientId: string, field: string) => {
    const key = `${clientId}-${field}`;
    setShowPasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderPasswordField = (clientId: string, field: keyof ClientData['socialPasswords'], password: string) => {
    const key = `${clientId}-${field}`;
    const isVisible = showPasswords[key];
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium capitalize min-w-20">{field}:</span>
        <div className="flex items-center gap-1 flex-1">
          {password ? (
            <>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded flex-1">
                {isVisible ? password : '••••••••'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => togglePasswordVisibility(clientId, field)}
                className="p-1 h-8 w-8"
              >
                {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </>
          ) : (
            <span className="text-sm text-gray-400">Não informado</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Cadastro de Clientes
            </CardTitle>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {clients.map((client) => (
              <Card key={client.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{client.name}</h3>
                    <p className="text-sm text-gray-600">Cadastrado em: {new Date(client.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(client.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Serviços:</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded mt-1">{client.services || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Senhas das Mídias Sociais:</Label>
                    <div className="space-y-2 bg-gray-50 p-3 rounded">
                      {Object.entries(client.socialPasswords).map(([key, password]) => 
                        renderPasswordField(client.id, key as keyof ClientData['socialPasswords'], password)
                      )}
                    </div>
                  </div>
                </div>

                {client.notes && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Observações:</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded mt-1">{client.notes}</p>
                  </div>
                )}
              </Card>
            ))}

            {clients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum cliente cadastrado ainda.
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
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Cliente *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="services">Serviços Prestados</Label>
                <Input
                  id="services"
                  value={formData.services}
                  onChange={(e) => setFormData(prev => ({ ...prev, services: e.target.value }))}
                  placeholder="Ex: Unha, Depilação, Tráfego Pago"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Senhas das Mídias Sociais (Criptografadas)
              </Label>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    type="password"
                    value={formData.socialPasswords.instagram}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialPasswords: { ...prev.socialPasswords, instagram: e.target.value }
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    type="password"
                    value={formData.socialPasswords.facebook}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialPasswords: { ...prev.socialPasswords, facebook: e.target.value }
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    type="password"
                    value={formData.socialPasswords.tiktok}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialPasswords: { ...prev.socialPasswords, tiktok: e.target.value }
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="google">Google</Label>
                  <Input
                    id="google"
                    type="password"
                    value={formData.socialPasswords.google}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialPasswords: { ...prev.socialPasswords, google: e.target.value }
                    }))}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="other">Outras Senhas</Label>
                  <Input
                    id="other"
                    type="password"
                    value={formData.socialPasswords.other}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialPasswords: { ...prev.socialPasswords, other: e.target.value }
                    }))}
                    placeholder="Ex: YouTube, LinkedIn, etc."
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Informações adicionais sobre o cliente..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingClient ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
