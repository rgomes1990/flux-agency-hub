import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DefaultObservation {
  id: string;
  module: string;
  text: string;
  is_completed: boolean;
  order_index: number;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

interface DefaultObservationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: string;
}

export function DefaultObservationsModal({ 
  open, 
  onOpenChange, 
  module 
}: DefaultObservationsModalProps) {
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const queryClient = useQueryClient();

  const { data: observations = [], isLoading } = useQuery({
    queryKey: ['default-observations', module],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('default_observations')
        .select('*')
        .eq('module', module)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as DefaultObservation[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (text: string) => {
      const { data, error } = await supabase
        .from('default_observations')
        .insert([{
          module,
          text: text,
          is_completed: false,
          order_index: observations.length,
          user_id: null
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-observations', module] });
      setNewText('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const { data, error } = await supabase
        .from('default_observations')
        .update({ text })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-observations', module] });
      setEditingId(null);
      setEditText('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('default_observations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-observations', module] });
    },
  });

  const handleAdd = () => {
    if (newText.trim()) {
      addMutation.mutate(newText.trim());
    }
  };

  const handleEdit = (observation: DefaultObservation) => {
    setEditingId(observation.id);
    setEditText(observation.text);
  };

  const handleUpdate = () => {
    if (editingId && editText.trim()) {
      updateMutation.mutate({
        id: editingId,
        text: editText.trim()
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta observação padrão?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Observações Padrão - {module.replace('_', ' ').toUpperCase()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Observation */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h4 className="font-medium text-gray-900">Adicionar Nova Observação</h4>
            <Input
              placeholder="Texto da observação"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
            <Button 
              onClick={handleAdd}
              disabled={!newText.trim() || addMutation.isPending}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Observação
            </Button>
          </div>

          {/* Existing Observations */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              Observações Existentes ({observations.length})
            </h4>
            
            {isLoading ? (
              <div className="text-center py-4">Carregando...</div>
            ) : observations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma observação padrão encontrada
              </div>
            ) : (
              <div className="space-y-3">
                {observations.map((observation) => (
                  <div key={observation.id} className="border rounded-lg p-4 bg-white">
                    {editingId === observation.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          placeholder="Texto da observação"
                        />
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={handleUpdate}
                            disabled={!editText.trim() || updateMutation.isPending}
                          >
                            Salvar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setEditingId(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{observation.text}</p>
                        </div>
                        <div className="flex space-x-1 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(observation)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(observation.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
