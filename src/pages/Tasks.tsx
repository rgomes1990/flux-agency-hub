import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Save, X, Trash2, Settings, Paperclip, Eye, ChevronUp, ChevronDown, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTasksData } from '@/hooks/useTasksData';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { AttachmentViewer } from '@/components/AttachmentViewer';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
    updateTask, 
    addTask, 
    deleteTask,
    addColumn,
    deleteColumn,
    updateColumn,
    reorderColumn,
    reorderTask,
    moveTask
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
  
  // Estados para edição completa de tarefa
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [editTaskFiles, setEditTaskFiles] = useState<{name: string; size: number; type: string; data: string}[]>([]);
  
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('bg-gray-100');
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');
  const [taskFiles, setTaskFiles] = useState<{name: string; size: number; type: string; data: string}[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'task' | 'column', id: string } | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<{name: string, size: number, type: string, data: string} | null>(null);
  const [showAttachmentViewer, setShowAttachmentViewer] = useState(false);
  
  // Drag and Drop states
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  const createNewTask = async () => {
    if (!newTaskTitle.trim() || !selectedColumn) return;

    await addTask(selectedColumn, { 
      title: newTaskTitle,
      description: newTaskDescription,
      priority: newTaskPriority,
      attachments: taskFiles
    });

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

  const startFullEditing = (task: any) => {
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description || '');
    setEditTaskPriority(task.priority);
    setEditTaskFiles(task.attachments || []);
    setShowEditTaskDialog(true);
  };

  const saveEdit = async () => {
    if (editingTaskId && editingTitle.trim()) {
      await updateTask(editingTaskId, { title: editingTitle });
    }
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const saveFullEdit = async () => {
    if (!editingTask) return;

    await updateTask(editingTask.id, {
      title: editTaskTitle,
      description: editTaskDescription,
      priority: editTaskPriority,
      attachments: editTaskFiles
    });

    setShowEditTaskDialog(false);
    setEditingTask(null);
    setEditTaskTitle('');
    setEditTaskDescription('');
    setEditTaskPriority('medium');
    setEditTaskFiles([]);
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const createNewColumn = async () => {
    if (!newColumnName.trim()) return;
    
    await addColumn(newColumnName, newColumnColor);
    
    setNewColumnName('');
    setNewColumnColor('bg-gray-100');
    setShowColumnDialog(false);
  };

  const startEditingColumn = (columnId: string, currentName: string) => {
    setEditingColumnId(columnId);
    setEditingColumnName(currentName);
  };

  const saveColumnEdit = async () => {
    if (editingColumnId && editingColumnName.trim()) {
      await updateColumn(editingColumnId, { title: editingColumnName });
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
        // Adicionar aos arquivos existentes em vez de substituir
        setTaskFiles(prev => [...prev, ...processedFiles]);
      };
      processFiles();
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        // Adicionar aos arquivos existentes em vez de substituir
        setEditTaskFiles(prev => [...prev, ...processedFiles]);
      };
      processFiles();
    }
  };

  const removeTaskFile = (index: number) => {
    setTaskFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeEditTaskFile = (index: number) => {
    setEditTaskFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    setConfirmDelete(null);
  };

  const handleDeleteColumn = async (columnId: string) => {
    await deleteColumn(columnId);
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

  // Drag and Drop functions
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Find the active task
    for (const column of columns) {
      const task = column.tasks.find(t => t.id === active.id);
      if (task) {
        setActiveTask(task);
        break;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Find columns
    const activeColumn = columns.find(col => 
      col.tasks.some(task => task.id === activeId)
    );
    const overColumn = columns.find(col => 
      col.id === overId || col.tasks.some(task => task.id === overId)
    );
    
    if (!activeColumn || !overColumn) return;
    
    // If moving to different column
    if (activeColumn.id !== overColumn.id) {
      const activeIndex = activeColumn.tasks.findIndex(t => t.id === activeId);
      const overIndex = overColumn.tasks.findIndex(t => t.id === overId);
      
      if (activeIndex !== -1) {
        moveTask(activeId, activeColumn.id, overColumn.id, overIndex !== -1 ? overIndex : overColumn.tasks.length);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    if (activeId === overId) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }
    
    // Find columns
    const activeColumn = columns.find(col => 
      col.tasks.some(task => task.id === activeId)
    );
    const overColumn = columns.find(col => 
      col.id === overId || col.tasks.some(task => task.id === overId)
    );
    
    if (!activeColumn || !overColumn) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }
    
    // If within same column, reorder
    if (activeColumn.id === overColumn.id) {
      const activeIndex = activeColumn.tasks.findIndex(t => t.id === activeId);
      const overIndex = activeColumn.tasks.findIndex(t => t.id === overId);
      
      if (activeIndex !== overIndex) {
        const newTasks = [...activeColumn.tasks];
        const [removed] = newTasks.splice(activeIndex, 1);
        newTasks.splice(overIndex, 0, removed);
        
        const newColumns = columns.map(col => 
          col.id === activeColumn.id ? { ...col, tasks: newTasks } : col
        );
        updateColumns(newColumns);
      }
    }
    
    setActiveId(null);
    setActiveTask(null);
  };

  // Sortable Task Component
  const SortableTask = ({ task, columnId, taskIndex }: { task: any, columnId: string, taskIndex: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <Card className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge className={getPriorityColor(task.priority)}>
                {getPriorityText(task.priority)}
              </Badge>
              <div className="flex space-x-1">
                {/* Drag handle */}
                <div
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
                  title="Arrastar tarefa"
                >
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
                
                {/* Botões de reordenação */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => reorderTask(task.id, columnId, 'up')}
                  disabled={taskIndex === 0}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-30"
                  title="Mover tarefa para cima"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => reorderTask(task.id, columnId, 'down')}
                  disabled={taskIndex === columns.find(col => col.id === columnId)?.tasks.length! - 1}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-30"
                  title="Mover tarefa para baixo"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                
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
                  onClick={() => startFullEditing(task)}
                  title="Editar tarefa completa"
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
              <div className="space-y-2">
                <p className="text-sm font-medium">{task.title}</p>
                {task.attachments && task.attachments.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Paperclip className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">{task.attachments.length} anexo{task.attachments.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
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
                  {taskFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-2">Arquivos selecionados:</p>
                      <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                        {taskFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded border">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <Paperclip className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{file.name}</span>
                              <span className="text-gray-500 flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeTaskFile(index)}
                              className="text-red-600 hover:text-red-800 p-1 h-auto"
                              title="Remover arquivo"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

          {/* Edit Task Dialog */}
          <Dialog open={showEditTaskDialog} onOpenChange={setShowEditTaskDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Tarefa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Título da tarefa"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Descrição da tarefa"
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prioridade</label>
                  <Select value={editTaskPriority} onValueChange={(value: any) => setEditTaskPriority(value)}>
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
                      onChange={handleEditFileChange}
                      className="text-sm"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.bitmap"
                    />
                    <Paperclip className="h-4 w-4 text-gray-400" />
                  </div>
                  {editTaskFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-2">Anexos atuais:</p>
                      <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                        {editTaskFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded border">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <Paperclip className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{file.name}</span>
                              <span className="text-gray-500 flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeEditTaskFile(index)}
                              className="text-red-600 hover:text-red-800 p-1 h-auto"
                              title="Remover arquivo"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button onClick={saveFullEdit} className="bg-orange-600 hover:bg-orange-700">
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => setShowEditTaskDialog(false)}>
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
                  <h4 className="font-medium">Colunas Existentes (arraste para reordenar):</h4>
                  {columns.map((column, index) => (
                    <div key={column.id} className="flex items-center justify-between p-2 border rounded bg-gray-50">
                      <div className="flex items-center space-x-2 flex-1">
                        <div className={`w-4 h-4 rounded ${column.color}`}></div>
                        <span className="text-sm font-medium">{column.title}</span>
                        <span className="text-xs text-gray-500">({column.tasks.length} tarefas)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => reorderColumn(column.id, 'up')}
                          disabled={index === 0}
                          className="text-gray-600 hover:text-gray-800 disabled:opacity-30"
                          title="Mover para cima"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => reorderColumn(column.id, 'down')}
                          disabled={index === columns.length - 1}
                          className="text-gray-600 hover:text-gray-800 disabled:opacity-30"
                          title="Mover para baixo"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDelete({ type: 'column', id: column.id })}
                          className="text-red-600 hover:text-red-800"
                          title="Excluir coluna"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
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
            
            <SortableContext 
              items={column.tasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex-1 bg-white rounded-b-lg p-3 space-y-3 overflow-y-auto shadow-sm border border-gray-200 min-h-[200px]" id={column.id}>
                {column.tasks.map((task, taskIndex) => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    columnId={column.id}
                    taskIndex={taskIndex}
                  />
                ))}
              </div>
            </SortableContext>
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
      
      <DragOverlay>
        {activeTask && (
          <div className="opacity-90 rotate-6">
            <Card className="cursor-grabbing shadow-lg border border-gray-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className={getPriorityColor(activeTask.priority)}>
                    {getPriorityText(activeTask.priority)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm font-medium">{activeTask.title}</p>
                  {activeTask.attachments && activeTask.attachments.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Paperclip className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-500">{activeTask.attachments.length} anexo{activeTask.attachments.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DragOverlay>
    </div>
    </DndContext>
  );
}
