
import React, { useState } from 'react';
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
  Video,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    color: 'text-blue-600'
  },
  {
    name: 'Conteúdo',
    icon: FileText,
    path: '/content',
    color: 'text-emerald-600'
  },
  {
    name: 'Conteúdo Padarias',
    icon: FileText,
    path: '/content-padarias',
    color: 'text-amber-600'
  },
  {
    name: 'Tarefas',
    icon: CheckSquare,
    path: '/tasks',
    color: 'text-purple-600'
  },
  {
    name: 'Tráfego Pago',
    icon: TrendingUp,
    path: '/traffic',
    color: 'text-red-600'
  },
  {
    name: 'Google My Business',
    icon: MapPin,
    path: '/google-my-business',
    color: 'text-green-600'
  },
  {
    name: 'RSG Avaliações',
    icon: Star,
    path: '/rsg-avaliacoes',
    color: 'text-yellow-600'
  },
  {
    name: 'Videos',
    icon: Video,
    path: '/videos',
    color: 'text-pink-600'
  },
  {
    name: 'Criação de Sites',
    icon: Globe,
    path: '/sites',
    color: 'text-indigo-600'
  },
  {
    name: 'Usuários',
    icon: Users,
    path: '/users',
    color: 'text-cyan-600'
  },
  {
    name: 'Senhas Clientes',
    icon: Lock,
    path: '/client-passwords',
    color: 'text-orange-600'
  },
  {
    name: 'Auditoria',
    icon: History,
    path: '/audit',
    color: 'text-gray-600'
  }
];

export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-xl transition-all duration-300 z-40",
        isCollapsed ? "w-16" : "w-64",
        "lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RSG Tarefas
              </h1>
              <p className="text-sm text-gray-500 mt-1">Agência de Marketing</p>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-8 w-8 hover:bg-gray-100"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg transition-colors",
                      isActive ? "bg-white shadow-sm" : "group-hover:bg-white group-hover:shadow-sm"
                    )}>
                      <Icon className={cn("h-4 w-4", isActive ? item.color : "text-gray-500 group-hover:text-gray-700")} />
                    </div>
                    
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {isActive && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {item.name}
                      </div>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                © 2024 RSG Tarefas
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
