
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface ServiceStatus {
  id: string;
  name: string;
  color: string;
}

interface StatusButtonProps {
  currentStatus: string;
  statuses: ServiceStatus[];
  onStatusChange: (statusId: string) => void;
}

export function StatusButton({ currentStatus, statuses, onStatusChange }: StatusButtonProps) {
  console.log('🎨 StatusButton: Renderizando com status:', { currentStatus, statuses });
  
  const currentStatusObj = statuses.find(s => s.id === currentStatus);
  
  // Se não há status configurados, mostrar mensagem
  if (!statuses || statuses.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="bg-gray-200 text-gray-600 border-0"
        disabled
      >
        Sem status configurados
      </Button>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`${currentStatusObj?.color || 'bg-gray-200'} text-white border-0 hover:opacity-80 relative z-10`}
          style={{ 
            backgroundColor: currentStatusObj?.color?.includes('bg-') ? undefined : currentStatusObj?.color
          }}
        >
          {currentStatusObj?.name || 'Status'}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-white border shadow-lg z-50">
        {statuses.map((status) => (
          <DropdownMenuItem
            key={status.id}
            onClick={() => {
              console.log('🎨 StatusButton: Status selecionado:', status);
              onStatusChange(status.id);
            }}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100"
          >
            <div 
              className={`w-3 h-3 rounded-full ${status.color}`}
              style={{ 
                backgroundColor: status.color?.includes('bg-') ? undefined : status.color
              }}
            />
            {status.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
