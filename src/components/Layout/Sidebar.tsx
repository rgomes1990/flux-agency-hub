
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  FileText, 
  Calendar,
  FolderOpen,
  Target,
  BarChart3,
  Settings,
  Shield,
  Database,
  Eye
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Usuários', href: '/users', icon: Users },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Tráfego Pago', href: '/traffic', icon: TrendingUp },
  { name: 'Conteúdo', href: '/content', icon: FileText },
  { name: 'Calendário', href: '/calendar', icon: Calendar },
  { name: 'Projetos', href: '/projects', icon: FolderOpen },
  { name: 'Tarefas', href: '/tasks', icon: Target },
  { name: 'Campanhas', href: '/campaigns', icon: Target },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Senhas Clientes', href: '/client-passwords', icon: Shield },
  { name: 'Auditoria', href: '/audit', icon: Database },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-orange-600">DIGITAL SOUL</h1>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive 
                      ? 'bg-orange-100 text-orange-900' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
