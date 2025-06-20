
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  TrendingUp,
  Users,
  Lock
} from 'lucide-react';

const menuItems = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    path: '/'
  },
  {
    name: 'Conteúdo',
    icon: FileText,
    path: '/content'
  },
  {
    name: 'Tarefas',
    icon: CheckSquare,
    path: '/tasks'
  },
  {
    name: 'Tráfego Pago',
    icon: TrendingUp,
    path: '/traffic'
  },
  {
    name: 'Usuários',
    icon: Users,
    path: '/users'
  },
  {
    name: 'Senhas Clientes',
    icon: Lock,
    path: '/client-passwords'
  }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">RSG Tarefas</h1>
        <p className="text-sm text-gray-600 mt-1">Agência de Marketing</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
