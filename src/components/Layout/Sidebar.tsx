
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  TrendingUp,
  Users,
  Lock,
  History,
  Globe,
  MapPin,
  Star,
  Video
} from 'lucide-react';

const menuItems = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard'
  },
  {
    name: 'Conteúdo',
    icon: FileText,
    path: '/content'
  },
  {
    name: 'Conteúdo Padarias',
    icon: FileText,
    path: '/content-padarias'
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
    name: 'Google My Business',
    icon: MapPin,
    path: '/google-my-business'
  },
  {
    name: 'RSG Avaliações',
    icon: Star,
    path: '/rsg-avaliacoes'
  },
  {
    name: 'Videos',
    icon: Video,
    path: '/videos'
  },
  {
    name: 'Criação de Sites',
    icon: Globe,
    path: '/sites'
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
  },
  {
    name: 'Auditoria',
    icon: History,
    path: '/audit'
  }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-blue-900 border-r border-blue-800 h-screen flex flex-col">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-xl font-bold text-white">RSG Tarefas</h1>
        <p className="text-sm text-blue-200 mt-1">Agência de Marketing</p>
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
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-200 hover:bg-blue-800 hover:text-white'
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
