
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { StatusButton } from '@/components/ServiceManagement/StatusButton';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Paperclip, GripVertical } from 'lucide-react';

interface SortableGMBRowProps {
  item: any;
  groupId: string;
  index: number;
  selectedItems: string[];
  columns: any[];
  onSelectItem: (itemId: string, checked: boolean) => void;
  onOpenClientDetails: (clientId: string) => void;
  onUpdateItemStatus: (itemId: string, field: string, statusId: string) => void;
  onUpdateClientField: (itemId: string, updates: any) => void;
  onDeleteClient: (clientId: string) => void;
  getClientFiles: (clientId: string) => any[];
  statuses: any[];
}

export function SortableGMBRow({
  item,
  groupId,
  index,
  selectedItems,
  columns,
  onSelectItem,
  onOpenClientDetails,
  onUpdateItemStatus,
  onUpdateClientField,
  onDeleteClient,
  getClientFiles,
  statuses
}: SortableGMBRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    data: {
      groupId: groupId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
      } ${isDragging ? 'z-50' : ''}`}
    >
      <div className="flex items-center min-w-max">
        <div className="w-8 flex items-center justify-center p-2">
          <Checkbox
            checked={selectedItems.includes(item.id)}
            onCheckedChange={(checked) => onSelectItem(item.id, !!checked)}
          />
        </div>
        <div className="w-48 p-2 border-r border-gray-200">
          <div className="flex items-center space-x-2">
            <div 
              {...attributes} 
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={() => onOpenClientDetails(item.id)}
              className="text-sm text-blue-600 hover:underline font-medium text-left"
            >
              {item.elemento}
            </button>
            {getClientFiles(item.id).length > 0 && (
              <Paperclip className="h-3 w-3 text-gray-400" />
            )}
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.id} className="w-48 p-2 border-r border-gray-200">
            {column.type === 'status' ? (
              <StatusButton
                currentStatus={item[column.id]?.id || item.status?.id || ''}
                statuses={statuses}
                onStatusChange={(statusId) => onUpdateItemStatus(item.id, column.id, statusId)}
              />
            ) : (
              <Input
                value={(item as any)[column.id] || ''}
                onChange={(e) => onUpdateClientField(item.id, { [column.id]: e.target.value })}
                className="border-0 bg-transparent p-0 h-auto"
                placeholder="..."
              />
            )}
          </div>
        ))}
        <div className="w-20 p-2 flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenClientDetails(item.id)}
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDeleteClient(item.id)}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
