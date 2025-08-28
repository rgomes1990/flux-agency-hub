
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusButton } from '@/components/ServiceManagement/StatusButton';
import { 
  ChevronDown, 
  ChevronRight,
  Edit,
  Trash2,
  Paperclip,
  MoreHorizontal,
  Calendar,
  Users
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableContentRow } from '@/components/ClientManagement/SortableContentRow';
import { ContentGroup, ContentColumn, ContentStatus } from '@/hooks/useContentData';

interface ContentGroupCardProps {
  group: ContentGroup;
  customColumns: ContentColumn[];
  statuses: ContentStatus[];
  selectedItems: string[];
  onSelectItem: (itemId: string, checked: boolean) => void;
  onOpenClientDetails: (clientId: string) => void;
  onUpdateItemStatus: (itemId: string, field: string, statusId: string) => void;
  onDeleteClient: (clientId: string) => void;
  onEditMonth: (groupId: string) => void;
  onDeleteMonth: (groupId: string) => void;
  viewMode: 'grid' | 'list';
}

export function ContentGroupCard({
  group,
  customColumns,
  statuses,
  selectedItems,
  onSelectItem,
  onOpenClientDetails,
  onUpdateItemStatus,
  onDeleteClient,
  onEditMonth,
  onDeleteMonth,
  viewMode
}: ContentGroupCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${group.color}`} />
              <h3 className="font-semibold text-lg">{group.name}</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{group.items.length}</span>
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditMonth(group.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Mês
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeleteMonth(group.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Mês
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {viewMode === 'grid' ? (
            <div className="space-y-3">
              {group.items.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => onSelectItem(item.id, !!checked)}
                      />
                      <div>
                        <button
                          onClick={() => onOpenClientDetails(item.id)}
                          className="font-medium text-primary hover:underline text-left"
                        >
                          {item.elemento}
                        </button>
                        {item.servicos && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.servicos}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {item.attachments && item.attachments.length > 0 && (
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteClient(item.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {customColumns.map((column) => (
                      <div key={column.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          {column.name}:
                        </span>
                        {column.type === 'status' ? (
                          <StatusButton
                            currentStatus={item[column.name] || ''}
                            statuses={statuses}
                            onStatusChange={(statusId) => {
                              onUpdateItemStatus(item.id, column.name, statusId);
                            }}
                          />
                        ) : (
                          <span className="text-sm">{item[column.name] || '-'}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <SortableContext 
                  items={group.items.map(item => item.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  {group.items.map((item, index) => (
                    <SortableContentRow 
                      key={item.id}
                      item={item}
                      groupId={group.id}
                      index={index}
                      selectedItems={selectedItems}
                      customColumns={customColumns}
                      onSelectItem={onSelectItem}
                      onOpenClientDetails={onOpenClientDetails}
                      onUpdateItemStatus={onUpdateItemStatus}
                      onDeleteClient={onDeleteClient}
                      statuses={statuses}
                    />
                  ))}
                </SortableContext>
              </div>
            </div>
          )}

          {group.items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum cliente neste mês</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
