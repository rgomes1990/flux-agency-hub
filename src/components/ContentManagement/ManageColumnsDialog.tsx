import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { ContentColumn } from '@/hooks/useContentData';

interface ManageColumnsDialogProps {
  customColumns: ContentColumn[];
  onUpdateColumns: (columns: ContentColumn[]) => void;
  onAddColumn?: (name: string, type: 'status' | 'text') => void;
  onMoveColumnUp?: (columnId: string) => void;
  onMoveColumnDown?: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
}

export function ManageColumnsDialog({ 
  customColumns = [],
  onUpdateColumns,
  onAddColumn,
  onMoveColumnUp,
  onMoveColumnDown,
  onDeleteColumn
}: ManageColumnsDialogProps) {
  const [open, setOpen] = useState(false);
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState<'status' | 'text'>('status');

  const handleAddColumn = () => {
    if (!columnName.trim()) return;
    
    if (onAddColumn) {
      onAddColumn(columnName, columnType);
    } else {
      // Fallback: create new column and update the columns list
      const newColumn: ContentColumn = {
        id: Date.now().toString(),
        name: columnName,
        type: columnType
      };
      onUpdateColumns([...customColumns, newColumn]);
    }
    
    setColumnName('');
    setColumnType('status');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Colunas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Gerenciar Colunas</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium">Criar Nova Coluna</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da Coluna</label>
                <Input
                  placeholder="Nome da coluna..."
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={columnType} onValueChange={(value: 'status' | 'text') => setColumnType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Status (com cores)</SelectItem>
                    <SelectItem value="text">Texto livre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAddColumn} className="w-full">
              Adicionar Coluna
            </Button>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Colunas Existentes</h4>
            <div className="space-y-2">
              {customColumns.map((column, index) => (
                <div key={column.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{column.name}</span>
                    <span className="text-sm text-muted-foreground">({column.type})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMoveColumnUp?.(column.id)}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMoveColumnDown?.(column.id)}
                      disabled={index === customColumns.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteColumn?.(column.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
