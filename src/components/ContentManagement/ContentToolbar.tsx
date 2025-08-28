
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search,
  Filter,
  Settings,
  Grid3X3,
  List,
  Copy,
  Users
} from 'lucide-react';
import { CreateMonthDialog } from './CreateMonthDialog';
import { DuplicateMonthDialog } from './DuplicateMonthDialog';
import { CreateClientDialog } from './CreateClientDialog';
import { ManageColumnsDialog } from './ManageColumnsDialog';
import { ContentGroup } from '@/hooks/useContentData';

interface ContentToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  groups: ContentGroup[];
  onManageStatuses: () => void;
}

export function ContentToolbar({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  groups,
  onManageStatuses
}: ContentToolbarProps) {
  return (
    <div className="border-b bg-card">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, serviço ou mês..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <CreateMonthDialog />
          <DuplicateMonthDialog groups={groups} />
          <CreateClientDialog groups={groups} />
          <ManageColumnsDialog />
          <Button 
            variant="outline" 
            size="sm"
            onClick={onManageStatuses}
          >
            <Settings className="h-4 w-4 mr-2" />
            Status
          </Button>
        </div>
      </div>
    </div>
  );
}
