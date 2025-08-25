
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Trash2,
  Paperclip,
  Eye,
  GripVertical
} from 'lucide-react';
import { StatusButton } from '@/components/ServiceManagement/StatusButton';

interface ContentItem {
  id: string;
  elemento: string;
  servicos: string;
  observacoes: string;
  hasAttachments?: boolean;
  attachments?: any[];
  status?: {
    id?: string;
    name?: string;
    color?: string;
  };
  [key: string]: any;
}

interface ContentColumn {
  id: string;
  name: string;
  type: 'status' | 'text';
}

interface ContentStatus {
  id: string;
  name: string;
  color: string;
}

interface SortableClientRowProps {
  item: ContentItem;
  groupId: string;
  index: number;
  selectedItems: string[];
  columns: ContentColumn[];
  onSelectItem: (itemId: string, checked: boolean) => void;
  onOpenClientDetails: (clientId: string) => void;
  onUpdateItemStatus: (itemId: string, status: any) => void;
  onDeleteClient: (clientId: string) => void;
  getClientAttachments: (clientId: string) => any[];
  openFilePreview: (file: File) => void;
  statuses: ContentStatus[];
}

export function SortableClientRow({
  item,
  groupId,
  index,
  selectedItems,
  columns,
  onSelectItem,
  onOpenClientDetails,
  onUpdateItemStatus,
  onDeleteClient,
  getClientAttachments,
  openFilePreview,
  statuses
}: SortableClientRowProps) {
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
      groupId,
      index,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  console.log('📋 SortableClientRow: Renderizando item:', {
    elemento: item.elemento,
    status: item.status,
    availableStatuses: statuses.length
  });

  const handleStatusChange = (statusId: string) => {
    console.log('📋 SortableClientRow: Mudança de status solicitada:', { itemId: item.id, statusId });
    
    const selectedStatus = statuses.find(s => s.id === statusId);
    if (selectedStatus) {
      console.log('📋 SortableClientRow: Status encontrado:', selectedStatus);
      onUpdateItemStatus(item.id, selectedStatus);
    } else {
      console.warn('📋 SortableClientRow: Status não encontrado:', statusId);
    }
  };

  const attachments = getClientAttachments(item.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors ${
        isDragging ? 'opacity-50 z-50' : ''
      }`}
    >
      <div className="flex items-center min-w-max">
        <div className="w-8 flex items-center justify-center p-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedItems.includes(item.id)}
              onCheckedChange={(checked) => onSelectItem(item.id, !!checked)}
            />
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="w-56 p-2 text-sm border-r border-gray-300">
          <div className="font-medium text-gray-900 truncate">{item.elemento}</div>
        </div>
        
        <div className="w-44 p-2 text-sm text-gray-600 border-r border-gray-300">
          <div className="truncate">{item.servicos}</div>
        </div>

        {columns.map((column) => (
          <div key={column.id} className="w-44 p-2 border-r border-gray-300">
            {column.type === 'status' ? (
              <StatusButton
                currentStatus={item.status?.id || ''}
                statuses={statuses}
                onStatusChange={handleStatusChange}
              />
            ) : (
              <div className="text-sm text-gray-600">
                {item[column.id] || '-'}
              </div>
            )}
          </div>
        ))}

        <div className="w-20 p-2 flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenClientDetails(item.id)}
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
            title="Ver detalhes"
          >
            <Eye className="h-3 w-3" />
          </Button>
          
          {attachments.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => attachments[0] && openFilePreview(attachments[0])}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
              title="Ver anexo"
            >
              <Paperclip className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDeleteClient(item.id)}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
            title="Excluir"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
