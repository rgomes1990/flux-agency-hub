
import { createContext, useContext } from 'react';
import { useAuth as useAuthHook, AuthProvider as AuthProviderHook } from '@/hooks/useAuth';

interface AppUser {
  id: string;
  username: string;
  created_at: string;
  is_active: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  logAudit: (tableName: string, recordId: string, action: string, oldValues?: any, newValues?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProviderHook>
      {children}
    </AuthProviderHook>
  );
}

export function useAuth() {
  return useAuthHook();
}
