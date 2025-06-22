
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
}

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_values?: any;
  new_values?: any;
  user_id?: string;
  user_username?: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  logAudit: (tableName: string, recordId: string, action: string, oldValues?: any, newValues?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para hash de senha SHA-256
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário logado no localStorage (para compatibilidade)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const logAudit = async (tableName: string, recordId: string, action: string, oldValues?: any, newValues?: any) => {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          table_name: tableName,
          record_id: recordId,
          action: action,
          old_values: oldValues,
          new_values: newValues,
          user_id: user?.id,
          user_username: user?.username,
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Erro ao registrar auditoria:', error);
      }
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      console.log('Tentando fazer login com:', username);
      
      const hashedPassword = await hashPassword(password);
      console.log('Hash da senha gerado:', hashedPassword);
      
      // Buscar usuário no Supabase
      const { data: users, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .limit(1);

      console.log('Resultado da consulta:', { users, error });

      if (error) {
        console.error('Erro na consulta:', error);
        return { error: { message: 'Erro ao verificar credenciais' } };
      }

      if (!users || users.length === 0) {
        console.log('Usuário não encontrado ou inativo');
        return { error: { message: 'Credenciais inválidas' } };
      }

      const foundUser = users[0];
      console.log('Usuário encontrado:', { 
        username: foundUser.username, 
        storedHash: foundUser.password_hash,
        providedHash: hashedPassword 
      });
      
      // Verificar se as senhas coincidem
      if (foundUser.password_hash !== hashedPassword) {
        console.log('Hash das senhas não coincidem');
        return { error: { message: 'Credenciais inválidas' } };
      }

      const userSession = {
        id: foundUser.id,
        username: foundUser.username
      };

      setUser(userSession);
      localStorage.setItem('currentUser', JSON.stringify(userSession));
      
      // Registrar login na auditoria
      await logAudit('auth', foundUser.id, 'LOGIN');
      
      console.log('Login realizado com sucesso');
      return { error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: { message: 'Erro ao fazer login' } };
    }
  };

  const signOut = async () => {
    if (user) {
      await logAudit('auth', user.id, 'LOGOUT');
    }
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    logAudit,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
