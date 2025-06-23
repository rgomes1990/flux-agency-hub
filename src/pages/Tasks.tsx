import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Save, X, Trash2, Settings, Paperclip, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTasksData } from '@/hooks/useTasksData';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { AttachmentViewer } from '@/components/AttachmentViewer';

const colorOptions = [
  { name: 'Cinza', value: 'bg-gray-100' },
  { name: 'Azul', value: 'bg-blue-100' },
  { name: 'Verde', value: 'bg-green-100' },
  { name: 'Amarelo', value: 'bg-yellow-100' },
  { name: 'Vermelho', value: 'bg-red-100' },
  { name: 'Roxo', value: 'bg-purple-100' },
  { name: 'Rosa', value: 'bg-pink-100' },
  { name: 'Laranja', value: 'bg-orange-100' }
];

export default function Tasks() {
  const { 
    columns, 
    updateColumns, 
    updateTaskTitle, 
    createTask, 
    deleteTask,
    addColumn,
    deleteColumn,
    editColumn,
    updateColumnColor
  } = useTasksData();
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [showTaskDetailsDialog, setShowTaskDetailsDialog] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<number>(0);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('bg-gray-100');
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');
  const [taskFiles, setTaskFiles] = useState<{name: string; size: number; type: string; data: string}[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'task' | 'column', id: string } | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<{name: string, size: number, type: string, data: string} | null>(null);
  const [showAttachmentViewer, setShowAttachmentViewer] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const createNewTask = () => {
    if (!newTaskTitle.trim() || !selectedColumn) return;

    createTask(selectedColumn, { 
      title: newTaskTitle,
      description: newTaskDescription,
      priority: newTaskPriority,
      attachments: taskFiles
    }, selectedPosition);

    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
    setSelectedColumn('');
    setSelectedPosition(0);
    setTaskFiles([]);
    setShowNewTaskDialog(false);
  };

  const startEditing = (taskId: string, currentTitle: string) => {
    setEditingTaskId(taskId);
    setEditingTitle(currentTitle);
  };

  const saveEdit = () => {
    if (editingTaskId && editingTitle.trim()) {
      updateTaskTitle(editingTaskId, editingTitle);
    }
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const createNewColumn = () => {
    if (!newColumnName.trim()) return;
    
    addColumn(newColumnName, newColumnColor);
    
    setNewColumnName('');
    setNewColumnColor('bg-gray-100');
    setShowColumnDialog(false);
  };

  const startEditingColumn = (columnId: string, currentName: string) => {
    setEditingColumnId(columnId);
    setEditingColumnName(currentName);
  };

  const saveColumnEdit = () => {
    if (editingColumnId && editingColumnName.trim()) {
      editColumn(editingColumnId, editingColumnName);
    }
    setEditingColumnId(null);
    setEditingColumnName('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const processFiles = async () => {
        const processedFiles = await Promise.all(
          files.map(file => {
            return new Promise<{name: string; size: number; type: string; data: string}>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  data: reader.result as string
                });
              };
              reader.readAsDataURL(file);
            });
          })
        );
        setTaskFiles(processedFiles);
      };
      processFiles();
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    setConfirmDelete(null);
  };

  const handleDeleteColumn = (columnId: string) => {
    deleteColumn(columnId);
    setConfirmDelete(null);
  };

  const getTaskDetails = (taskId: string) => {
    for (const column of columns) {
      const task = column.tasks.find(t => t.id === taskId);
      if (task) return task;
    }
    return null;
  };

  const openAttachmentPreview = (attachment: {name: string, size: number, type: string, data: string}) => {
    setPreviewAttachment(attachment);
    setShowAttachmentViewer(true);
  };

  return (
    <div className="p-6 h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas tarefas no estilo Kanban</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Título da tarefa"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Descrição da tarefa"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prioridade</label>
                  <Select value={newTaskPriority} onValueChange={(value: any) => setNewTaskPriority(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Anexos</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="text-sm"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.bitmap"
                    />
                    <Paperclip className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Coluna</label>
                  <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma coluna" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(col => (
                        <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedColumn && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Posição</label>
                    <Select value={selectedPosition.toString()} onValueChange={(value) => setSelectedPosition(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a posição" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.find(col => col.id === selectedColumn)?.tasks.map((_, index) => (
                          <SelectItem key={index} value={index.toString()}>Posição {index + 1}</SelectItem>
                        ))}
                        <SelectItem value={(columns.find(col => col.id === selectedColumn)?.tasks.length || 0).toString()}>
                          Última posição
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button onClick={createNewTask} className="bg-orange-600 hover:bg-orange-700">
                    Criar
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewTaskDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Gerenciar Colunas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gerenciar Colunas</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome da nova coluna"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cor da Coluna</label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`w-full h-8 rounded ${color.value} border-2 ${
                          newColumnColor === color.value ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        onClick={() => setNewColumnColor(color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={createNewColumn} className="w-full">
                  Criar Nova Coluna
                </Button>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Colunas Existentes:</h4>
                  {columns.map(column => (
                    <div key={column.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded ${column.color}`}></div>
                        <span className="text-sm">{column.title}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDelete({ type: 'column', id: column.id })}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className={`grid gap-6 h-[calc(100vh-200px)]`} style={{gridTemplateColumns: `repeat(${columns.length}, minmax(300px, 1fr))`}}>
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col">
            <div className={`${column.color} rounded-t-lg p-3 border-b-2 border-gray-200`}>
              <div className="flex items-center justify-between">
                {editingColumnId === column.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <Input
                      value={editingColumnName}
                      onChange={(e) => setEditingColumnName(e.target.value)}
                      className="bg-white text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && saveColumnEdit()}
                    />
                    <Button size="sm" onClick={saveColumnEdit}>
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingColumnId(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-gray-800">{column.title}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-white text-gray-700">
                        {column.tasks.length}
                      </Badge>
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditingColumn(column.id, column.title)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDelete({ type: 'column', id: column.id })}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex-1 bg-white rounded-b-lg p-3 space-y-3 overflow-y-auto shadow-sm border border-gray-200">
              {column.tasks.map((task) => (
                <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getPriorityColor(task.priority)}>
                        {getPriorityText(task.priority)}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowTaskDetailsDialog(task.id)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => startEditing(task.id, task.title)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setConfirmDelete({ type: 'task', id: task.id })}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {editingTaskId === task.id ? (
                      <div className="flex items-center space-x-2 mt-2">
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        />
                        <Button size="sm" onClick={saveEdit}>
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm font-medium">{task.title}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Details Dialog */}
      <Dialog open={!!showTaskDetailsDialog} onOpenChange={(open) => !open && setShowTaskDetailsDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Tarefa</DialogTitle>
          </DialogHeader>
          {showTaskDetailsDialog && (
            <div className="space-y-4">
              {(() => {
                const task = getTaskDetails(showTaskDetailsDialog);
                if (!task) return <p>Tarefa não encontrada</p>;
                
                return (
                  <>
                    <div>
                      <h3 className="font-medium text-lg">{task.title}</h3>
                      <Badge className={`${getPriorityColor(task.priority)} mt-2`}>
                        {getPriorityText(task.priority)}
                      </Badge>
                    </div>
                    
                    <div>
                      <label className="font-medium">Descrição:</label>
                      <p className="text-gray-600 mt-1">{task.description}</p>
                    </div>
                    
                    {task.attachments && task.attachments.length > 0 && (
                      <div>
                        <label className="font-medium">Anexos:</label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {task.attachments.map((attachment, index) => (
                            <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                              <button
                                onClick={() => openAttachmentPreview(attachment)}
                                className="flex items-center space-x-2 text-sm text-blue-600 w-full text-left"
                              >
                                <Paperclip className="h-4 w-4" />
                                <span className="truncate">{attachment.name}</span>
                              </button>
                              <p className="text-xs text-gray-500 mt-1">
                                {(attachment.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AttachmentViewer
        attachment={previewAttachment}
        open={showAttachmentViewer}
        onOpenChange={setShowAttachmentViewer}
      />

      <ConfirmationDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete?.type === 'task') {
            handleDeleteTask(confirmDelete.id);
          } else if (confirmDelete?.type === 'column') {
            handleDeleteColumn(confirmDelete.id);
          }
        }}
        title="Confirmar Exclusão"
        message={
          confirmDelete?.type === 'task' 
            ? "Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
            : "Tem certeza que deseja excluir esta coluna? Todas as tarefas serão perdidas. Esta ação não pode ser desfeita."
        }
        confirmText="Excluir"
      />
    </div>
  );
}
