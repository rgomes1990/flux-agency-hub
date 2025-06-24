
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

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
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  logAudit: (tableName: string, recordId: string, action: string, oldValues?: any, newValues?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Configurando autenticação...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
          user_username: user.email,
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

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentando fazer login:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erro no login:', error);
        return { error };
      }

      console.log('Login realizado com sucesso');
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
      await supabase.auth.signOut();
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const value = {
    user,
    session,
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
