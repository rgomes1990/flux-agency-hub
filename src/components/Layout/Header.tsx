
import React, { useState } from 'react';
import { LogOut, User, Bell, Search, Sun, Moon, Menu, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { UndoButton } from './UndoButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Here you would implement actual theme switching logic
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 lg:px-6 flex items-center justify-between shadow-sm sticky top-0 z-40">
      <div className="flex items-center space-x-4 flex-1">
        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar clientes, tarefas..."
            className="pl-10 bg-gray-50/80 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500 h-9 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 h-9 w-9">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500 hover:bg-red-600 flex items-center justify-center">
            3
          </Badge>
        </Button>

        {/* Undo Button */}
        <UndoButton />

        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-gray-100 h-9 w-9"
          onClick={toggleTheme}
        >
          {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100 h-9 px-3">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.username || 'Usuário'}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.username || 'Usuário'}</p>
              <p className="text-xs text-gray-500">admin@rsg.com</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut} 
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
