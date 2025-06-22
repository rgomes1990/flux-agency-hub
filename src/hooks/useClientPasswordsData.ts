
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface ClientPassword {
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
  const { logAudit } = useAuth();

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

  const addPassword = async (passwordData: Omit<ClientPassword, 'id' | 'createdAt'>) => {
    const newPassword: ClientPassword = {
      id: `password-${Date.now()}`,
      ...passwordData,
      createdAt: new Date().toISOString()
    };
    
    setPasswords(prev => [newPassword, ...prev]);
    
    // Registrar na auditoria
    await logAudit('client_passwords', newPassword.id, 'INSERT', null, {
      cliente: passwordData.cliente,
      plataforma: passwordData.plataforma
    });
    
    return newPassword.id;
  };

  const updatePassword = async (id: string, updates: Partial<ClientPassword>) => {
    const oldPassword = passwords.find(p => p.id === id);
    
    setPasswords(prev => prev.map(password => 
      password.id === id ? { ...password, ...updates } : password
    ));
    
    // Registrar na auditoria
    await logAudit('client_passwords', id, 'UPDATE', 
      { cliente: oldPassword?.cliente, plataforma: oldPassword?.plataforma },
      { cliente: updates.cliente, plataforma: updates.plataforma }
    );
  };

  const deletePassword = async (id: string) => {
    const passwordToDelete = passwords.find(p => p.id === id);
    
    setPasswords(prev => prev.filter(password => password.id !== id));
    
    // Registrar na auditoria
    await logAudit('client_passwords', id, 'DELETE', 
      { cliente: passwordToDelete?.cliente, plataforma: passwordToDelete?.plataforma }, 
      null
    );
  };

  return {
    passwords,
    addPassword,
    updatePassword,
    deletePassword
  };
};
