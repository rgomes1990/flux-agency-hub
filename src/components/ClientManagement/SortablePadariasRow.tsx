
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { StatusButton } from '@/components/ServiceManagement/StatusButton';
import { Edit, Trash2, Paperclip, Eye, GripVertical } from 'lucide-react';

interface SortablePadariasRowProps {
  item: any;
  groupId: string;
  index: number;
  selectedItems: string[];
  customColumns: any[];
  onSelectItem: (itemId: string, checked: boolean) => void;
  onOpenClientDetails: (clientId: string) => void;
  onUpdateItemStatus: (itemId: string, field: string, statusId: string) => void;
  onDeleteClient: (clientId: string) => void;
  statuses: any[];
}

export function SortablePadariasRow({
  item,
  groupId,
  index,
  selectedItems,
  customColumns,
  onSelectItem,
  onOpenClientDetails,
  onUpdateItemStatus,
  onDeleteClient,
  statuses
}: SortablePadariasRowProps) {
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
        <div className="w-56 p-2 border-r border-gray-200">
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
            {item.attachments && item.attachments.length > 0 && (
              <Paperclip className="h-3 w-3 text-gray-400" />
            )}
          </div>
        </div>
        <div className="w-44 p-2 border-r border-gray-200">
          <span className="text-sm text-gray-700">{item.servicos}</span>
        </div>
        {customColumns.map((column) => (
          <div key={column.id} className="w-44 p-2 border-r border-gray-200">
            {column.type === 'status' ? (
              <StatusButton
                currentStatus={item[column.id]?.id || ''}
                statuses={statuses}
                onStatusChange={(statusId) => {
                  console.log('🎨 Padarias: Selecionando status para coluna:', column.id, 'status:', statusId);
                  onUpdateItemStatus(item.id, column.id, statusId);
                }}
              />
            ) : (
              <span className="text-sm text-gray-700">{item[column.id] || ''}</span>
            )}
          </div>
        ))}
        <div className="w-20 p-2 flex items-center space-x-1">
          <div className="flex items-center space-x-1">
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
    </div>
  );
}
