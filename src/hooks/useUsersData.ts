
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface User {
  id: string;
  username: string;
  password: string;
  password_hash?: string;
  createdAt: string;
  created_at?: string;
  is_active?: boolean;
}

// Função para hash de senha
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const useUsersData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { logAudit, user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        return;
      }

      // Mapear dados do Supabase para o formato esperado
      const mappedUsers = data?.map(user => ({
        id: user.id,
        username: user.username,
        password: '****', // Não mostrar senha real
        createdAt: user.created_at,
        is_active: user.is_active
      })) || [];

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const addUser = async (username: string, password: string) => {
    try {
      const hashedPassword = await hashPassword(password);
      
      const { data, error } = await supabase
        .from('app_users')
        .insert({
          username,
          password_hash: hashedPassword,
          created_by: currentUser?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar usuário:', error);
        throw error;
      }

      const newUser: User = {
        id: data.id,
        username: data.username,
        password: '****',
        createdAt: data.created_at,
        is_active: data.is_active
      };

      setUsers(prev => [newUser, ...prev]);
      
      // Registrar na auditoria
      await logAudit('app_users', data.id, 'INSERT', null, { username });
      
      return data.id;
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const updateData: any = {};
      
      if (updates.username) {
        updateData.username = updates.username;
      }
      
      if (updates.password && updates.password !== '****') {
        updateData.password_hash = await hashPassword(updates.password);
      }

      const { error } = await supabase
        .from('app_users')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar usuário:', error);
        throw error;
      }

      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...updates, password: updates.password || '****' } : user
      ));
      
      // Registrar na auditoria
      await logAudit('app_users', id, 'UPDATE', null, updates);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const userToDelete = users.find(u => u.id === id);
      
      const { error } = await supabase
        .from('app_users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir usuário:', error);
        throw error;
      }

      setUsers(prev => prev.filter(user => user.id !== id));
      
      // Registrar na auditoria
      await logAudit('app_users', id, 'DELETE', { username: userToDelete?.username }, null);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw error;
    }
  };

  return {
    users,
    loading,
    addUser,
    updateUser,
    deleteUser,
    refreshUsers: loadUsers
  };
};
