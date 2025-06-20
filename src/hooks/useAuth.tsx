
import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
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

  const signIn = async (username: string, password: string) => {
    try {
      // Buscar usuários do localStorage
      const usersData = localStorage.getItem('usersData');
      if (!usersData) {
        return { error: { message: 'Nenhum usuário cadastrado no sistema' } };
      }

      const users = JSON.parse(usersData);
      const foundUser = users.find((u: any) => u.username === username && u.password === password);
      
      if (!foundUser) {
        return { error: { message: 'Credenciais inválidas' } };
      }

      const userSession = {
        id: foundUser.id,
        username: foundUser.username
      };

      setUser(userSession);
      localStorage.setItem('currentUser', JSON.stringify(userSession));
      
      return { error: null };
    } catch (error) {
      return { error: { message: 'Erro ao fazer login' } };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
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
