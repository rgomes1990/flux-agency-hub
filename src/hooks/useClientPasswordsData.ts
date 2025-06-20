
import { useState, useEffect } from 'react';

interface ClientPassword {
  id: string;
  clientName: string;
  platform: string;
  login: string;
  password: string;
  createdAt: string;
}

export const useClientPasswordsData = () => {
  const [passwords, setPasswords] = useState<ClientPassword[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem('clientPasswordsData');
    if (savedData) {
      try {
        setPasswords(JSON.parse(savedData));
      } catch (error) {
        console.error('Erro ao carregar senhas dos clientes:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('clientPasswordsData', JSON.stringify(passwords));
  }, [passwords]);

  const addPassword = (clientName: string, platform: string, login: string, password: string) => {
    const newPassword: ClientPassword = {
      id: `password-${Date.now()}`,
      clientName,
      platform,
      login,
      password,
      createdAt: new Date().toISOString()
    };
    setPasswords(prev => [...prev, newPassword]);
    return newPassword.id;
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
