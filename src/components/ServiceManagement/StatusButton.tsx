
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
  const currentStatusObj = statuses.find(s => s.id === currentStatus);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`${currentStatusObj?.color || 'bg-gray-200'} text-white border-0 hover:opacity-80`}
        >
          {currentStatusObj?.name || 'Selecionar'}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {statuses.map((status) => (
          <DropdownMenuItem
            key={status.id}
            onClick={() => onStatusChange(status.id)}
            className="flex items-center gap-2"
          >
            <div className={`w-3 h-3 rounded-full ${status.color}`} />
            {status.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
