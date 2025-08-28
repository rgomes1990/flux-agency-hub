
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Users, Settings, BarChart3 } from 'lucide-react';

interface ContentHeaderProps {
  totalGroups: number;
  totalColumns: number;
  totalStatuses: number;
  selectedItemsCount: number;
  onSelectAll: (checked: boolean) => void;
}

export function ContentHeader({
  totalGroups,
  totalColumns,
  totalStatuses,
  selectedItemsCount,
  onSelectAll
}: ContentHeaderProps) {
  return (
    <div className="border-b bg-card">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Gestão de Conteúdo</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <BarChart3 className="h-3 w-3" />
              <span>{totalGroups} Meses</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Settings className="h-3 w-3" />
              <span>{totalColumns} Colunas</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{totalStatuses} Status</span>
            </Badge>
          </div>
        </div>

        {selectedItemsCount > 0 && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedItemsCount > 0}
                onCheckedChange={onSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedItemsCount} itens selecionados
              </span>
            </div>
            <Button variant="destructive" size="sm">
              Excluir Selecionados
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
