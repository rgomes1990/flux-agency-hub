
import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export const useUsersData = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem('usersData');
    if (savedData) {
      try {
        setUsers(JSON.parse(savedData));
      } catch (error) {
        console.error('Erro ao carregar dados dos usuários:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('usersData', JSON.stringify(users));
  }, [users]);

  const addUser = (username: string, password: string) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      password,
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    return newUser.id;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  return {
    users,
    addUser,
    updateUser,
    deleteUser
  };
};
