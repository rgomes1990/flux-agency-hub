import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ClientPassword {
  id: string;
  cliente: string;
  plataforma: string;
  observacoes?: string;
  attachments?: File[];
  createdAt: string;
}

export const useClientPasswordsData = () => {
  const [passwords, setPasswords] = useState<ClientPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logAudit } = useAuth();

  const loadPasswords = async () => {
    try {
      console.log('🔄 Carregando senhas dos clientes...');
      setLoading(true);

      const { data, error } = await supabase
        .from('client_passwords')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar senhas:', error);
        throw error;
      }

      console.log('✅ Senhas carregadas:', data?.length || 0);

      const formattedPasswords: ClientPassword[] = (data || []).map(item => ({
        id: item.id,
        cliente: item.cliente,
        plataforma: item.plataforma,
        observacoes: item.observacoes || undefined,
        attachments: item.attachments ? (typeof item.attachments === 'string' ? JSON.parse(item.attachments) : item.attachments) : [],
        createdAt: item.created_at
      }));

      setPasswords(formattedPasswords);
    } catch (error) {
      console.error('❌ Erro ao carregar senhas:', error);
      setPasswords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPasswords();
  }, []);

  const addPassword = async (passwordData: Omit<ClientPassword, 'id' | 'createdAt'>) => {
    try {
      console.log('🔄 Adicionando senha:', passwordData);
      
      // Primeiro criar backup dos dados atuais
      if (user && logAudit) {
        await logAudit('client_passwords', 'backup', 'BACKUP', null, { 
          total_passwords: passwords.length,
          action: 'before_insert' 
        });
      }
      
      const { data, error } = await supabase
        .from('client_passwords')
        .insert({
          user_id: user?.id || null,
          cliente: passwordData.cliente,
          plataforma: passwordData.plataforma,
          observacoes: passwordData.observacoes || null,
          attachments: passwordData.attachments ? JSON.stringify(passwordData.attachments) : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao adicionar senha:', error);
        throw error;
      }

      console.log('✅ Senha adicionada com sucesso:', data);

      const newPassword: ClientPassword = {
        id: data.id,
        cliente: data.cliente,
        plataforma: data.plataforma,
        observacoes: data.observacoes || undefined,
        attachments: data.attachments ? JSON.parse(data.attachments as string) : [],
        createdAt: data.created_at
      };

      setPasswords(prev => [newPassword, ...prev]);

      // Registrar na auditoria
      if (user && logAudit) {
        await logAudit('client_passwords', data.id, 'INSERT', null, {
          cliente: passwordData.cliente,
          plataforma: passwordData.plataforma
        });
      }

      // Recarregar dados para garantir consistência
      await loadPasswords();

      return data.id;
    } catch (error) {
      console.error('❌ Erro ao adicionar senha:', error);
      throw error;
    }
  };

  const updatePassword = async (id: string, updates: Partial<ClientPassword>) => {
    const oldPassword = passwords.find(p => p.id === id);
    
    try {
      console.log('🔄 Atualizando senha:', id, updates);
      
      const { error } = await supabase
        .from('client_passwords')
        .update({
          cliente: updates.cliente,
          plataforma: updates.plataforma,
          observacoes: updates.observacoes,
          attachments: updates.attachments ? JSON.stringify(updates.attachments) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao atualizar senha:', error);
        throw error;
      }

      console.log('✅ Senha atualizada com sucesso');

      setPasswords(prev => prev.map(password => 
        password.id === id ? { ...password, ...updates } : password
      ));

      if (user && logAudit) {
        await logAudit('client_passwords', id, 'UPDATE', 
          { cliente: oldPassword?.cliente, plataforma: oldPassword?.plataforma },
          { cliente: updates.cliente, plataforma: updates.plataforma }
        );
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar senha:', error);
      throw error;
    }
  };

  const deletePassword = async (id: string) => {
    const passwordToDelete = passwords.find(p => p.id === id);
    
    try {
      console.log('🔄 Deletando senha:', id);
      
      const { error } = await supabase
        .from('client_passwords')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao deletar senha:', error);
        throw error;
      }

      console.log('✅ Senha deletada com sucesso');

      setPasswords(prev => prev.filter(password => password.id !== id));

      if (user && logAudit) {
        await logAudit('client_passwords', id, 'DELETE', 
          { cliente: passwordToDelete?.cliente, plataforma: passwordToDelete?.plataforma }, 
          null
        );
      }
    } catch (error) {
      console.error('❌ Erro ao deletar senha:', error);
      throw error;
    }
  };

  return {
    passwords,
    loading,
    addPassword,
    updatePassword,
    deletePassword,
    refreshPasswords: loadPasswords
  };
};
