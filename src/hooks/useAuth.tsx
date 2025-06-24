
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AppUser {
  id: string;
  username: string;
  created_at: string;
  is_active: boolean;
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
  user: AppUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  logAudit: (tableName: string, recordId: string, action: string, oldValues?: any, newValues?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para hash de senha
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Configurando autenticação personalizada...');
    
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('Usuário encontrado no localStorage:', userData.username);
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem('currentUser');
      }
    }
    
    setLoading(false);
  }, []);

  const logAudit = async (tableName: string, recordId: string, action: string, oldValues?: any, newValues?: any) => {
    try {
      if (!user) {
        console.log('Usuário não logado - não é possível registrar auditoria');
        return;
      }

      console.log('Registrando auditoria:', { tableName, recordId, action, userId: user.id });

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          table_name: tableName,
          record_id: recordId,
          action: action,
          old_values: oldValues,
          new_values: newValues,
          user_id: user.id,
          user_username: user.username,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
        });

      if (error) {
        console.error('Erro ao registrar auditoria:', error);
      } else {
        console.log('Auditoria registrada com sucesso');
      }
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      console.log('Tentando fazer login com usuário:', username);
      
      // Hash da senha fornecida
      const hashedPassword = await hashPassword(password);
      
      // Buscar usuário na tabela app_users
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', hashedPassword)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error('Erro no login - credenciais inválidas:', error);
        return { error: { message: 'Usuário ou senha inválidos' } };
      }

      const userData: AppUser = {
        id: data.id,
        username: data.username,
        created_at: data.created_at,
        is_active: data.is_active
      };

      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Registrar login na auditoria
      await logAudit('auth', userData.id, 'LOGIN');
      
      console.log('Login realizado com sucesso para:', username);
      return { error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: { message: 'Erro ao fazer login' } };
    }
  };

  const signOut = async () => {
    try {
      if (user) {
        await logAudit('auth', user.id, 'LOGOUT');
      }
      
      setUser(null);
      localStorage.removeItem('currentUser');
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
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
