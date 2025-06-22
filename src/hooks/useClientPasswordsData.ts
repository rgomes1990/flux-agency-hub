
import { useState, useEffect } from 'react';

export interface ClientPassword {
  id: string;
  cliente: string;
  plataforma: string;
  usuario: string;
  senha: string;
  observacoes?: string;
  attachments?: File[];
  createdAt: string;
}

export const useClientPasswordsData = () => {
  const [passwords, setPasswords] = useState<ClientPassword[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem('clientPasswords');
    if (savedData) {
      try {
        setPasswords(JSON.parse(savedData));
      } catch (error) {
        console.error('Erro ao carregar senhas:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('clientPasswords', JSON.stringify(passwords));
  }, [passwords]);

  const addPassword = (newPassword: Omit<ClientPassword, 'id' | 'createdAt'>) => {
    const passwordWithId: ClientPassword = {
      ...newPassword,
      id: `password-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    setPasswords(prev => [passwordWithId, ...prev]);
    return passwordWithId.id;
  };

  const updatePassword = (id: string, updates: Partial<ClientPassword>) => {
    setPasswords(prev => prev.map(password => 
      password.id === id ? { ...password, ...updates } : password
    ));
  };

  const deletePassword = (id: string) => {
    setPasswords(prev => prev.filter(password => password.id !== id));
  };

  return {
    passwords,
    addPassword,
    updatePassword,
    deletePassword
  };
};
