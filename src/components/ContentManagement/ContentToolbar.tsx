
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Grid, List, Download } from 'lucide-react';
import { CreateMonthDialog } from './CreateMonthDialog';
import { DuplicateMonthDialog } from './DuplicateMonthDialog';
import { CreateClientDialog } from './CreateClientDialog';
import { ManageColumnsDialog } from './ManageColumnsDialog';
import { ContentGroup, ContentColumn } from '@/hooks/useContentData';

interface ContentToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  selectedItems: string[];
  groups: ContentGroup[];
  customColumns: ContentColumn[];
  onCreateMonth: (name: string, color: string) => void;
  onDuplicateMonth: (sourceGroupId: string, newName: string, newColor: string) => void;
  onAddClient: (groupId: string, client: { elemento: string; servicos: string }) => void;
  onUpdateColumns: (columns: ContentColumn[]) => void;
}

export function ContentToolbar({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  selectedItems = [], // Default to empty array to prevent undefined errors
  groups,
  customColumns,
  onCreateMonth,
  onDuplicateMonth,
  onAddClient,
  onUpdateColumns
}: ContentToolbarProps) {
  const handleCreateMonth = (monthName: string) => {
    // Generate a random color for the month
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    onCreateMonth(monthName, randomColor);
  };

  const handleDuplicateMonth = (groupId: string, newMonthName: string) => {
    // Generate a random color for the duplicated month
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    onDuplicateMonth(groupId, newMonthName, randomColor);
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search and View Controls */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar clientes..."
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
              <Grid className="h-4 w-4" />
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

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <CreateClientDialog groups={groups} onAddClient={onAddClient} />
          
          <CreateMonthDialog onCreateMonth={handleCreateMonth} />
          
          <DuplicateMonthDialog groups={groups} onDuplicateMonth={handleDuplicateMonth} />
          
          <ManageColumnsDialog
            customColumns={customColumns}
            onUpdateColumns={onUpdateColumns}
          />

          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
              <span className="text-sm text-gray-600">
                {selectedItems.length} selecionado(s)
              </span>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
