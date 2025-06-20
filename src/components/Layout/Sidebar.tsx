
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PenTool, 
  CheckSquare,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Conteúdo', href: '/content', icon: PenTool },
  { name: 'Tarefas', href: '/tasks', icon: CheckSquare },
];

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-orange-400" />
          <h1 className="text-xl font-bold text-orange-400">MarketingPro</h1>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-sm font-medium">MP</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Marketing Pro</p>
            <p className="text-xs text-gray-400">Agência de Marketing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
