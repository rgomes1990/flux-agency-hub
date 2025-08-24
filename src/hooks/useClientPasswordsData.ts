
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ClientPassword {
  id: string;
  cliente: string;
  plataforma: string;
  observacoes?: string;
  attachments?: Array<{ name: string; data: string; type: string; size?: number }>;
}

export function useClientPasswordsData() {
  const [passwords, setPasswords] = useState<ClientPassword[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPasswords = useCallback(async () => {
    console.log('🔄 Carregando senhas dos clientes...');
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('client_passwords')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar senhas:', error);
        throw error;
      }

      console.log('📊 Senhas carregadas:', data?.length || 0);

      if (data) {
        const formattedPasswords = data.map(item => ({
          id: item.id,
          cliente: item.cliente,
          plataforma: item.plataforma,
          observacoes: item.observacoes || '',
          attachments: item.attachments ? (Array.isArray(item.attachments) ? item.attachments : []) : []
        }));

        setPasswords(formattedPasswords);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar senhas dos clientes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPasswords();
  }, [loadPasswords]);

  const addPassword = async (password: Omit<ClientPassword, 'id'>) => {
    console.log('➕ Adicionando nova senha:', password.cliente);
    
    try {
      const { data, error } = await supabase
        .from('client_passwords')
        .insert({
          cliente: password.cliente,
          plataforma: password.plataforma,
          observacoes: password.observacoes || '',
          attachments: password.attachments || null
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao adicionar senha:', error);
        throw error;
      }

      console.log('✅ Senha adicionada com sucesso:', data);
      await loadPasswords(); // Recarregar dados
    } catch (error) {
      console.error('❌ Erro ao adicionar senha:', error);
      throw error;
    }
  };

  const updatePassword = async (id: string, updates: Partial<ClientPassword>) => {
    console.log('🔄 Atualizando senha:', id);
    
    try {
      const { error } = await supabase
        .from('client_passwords')
        .update({
          cliente: updates.cliente,
          plataforma: updates.plataforma,
          observacoes: updates.observacoes || '',
          attachments: updates.attachments || null
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao atualizar senha:', error);
        throw error;
      }

      console.log('✅ Senha atualizada com sucesso');
      await loadPasswords(); // Recarregar dados
    } catch (error) {
      console.error('❌ Erro ao atualizar senha:', error);
      throw error;
    }
  };

  const deletePassword = async (id: string) => {
    console.log('🗑️ Deletando senha:', id);
    
    try {
      const { error } = await supabase
        .from('client_passwords')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao deletar senha:', error);
        throw error;
      }

      console.log('✅ Senha deletada com sucesso');
      await loadPasswords(); // Recarregar dados
    } catch (error) {
      console.error('❌ Erro ao deletar senha:', error);
      throw error;
    }
  };

  return {
    passwords,
    isLoading,
    addPassword,
    updatePassword,
    deletePassword,
    loadPasswords
  };
}
