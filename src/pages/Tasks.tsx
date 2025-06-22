
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Paperclip, FileText, Image, File } from 'lucide-react';
import { useTasksData } from '@/hooks/useTasksData';
import { FilePreview } from '@/components/FilePreview';

interface SerializedFile {
  name: string;
  size: number;
  type: string;
  data: string;
}

export default function Tasks() {
  const { columns, moveTask, addTask, updateTask, deleteTask } = useTasksData();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    attachments: [] as File[]
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewTask(prev => ({ 
        ...prev, 
        attachments: [...prev.attachments, ...files]
      }));
    }
  };

  const removeFile = (index: number) => {
    setNewTask(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const serializeFiles = async (files: File[]): Promise<SerializedFile[]> => {
    const serializedFiles: SerializedFile[] = [];
    
    for (const file of files) {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      serializedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        data: dataUrl
      });
    }
    
    return serializedFiles;
  };

  const handleAddTask = async () => {
    if (newTask.title.trim()) {
      const serializedAttachments = await serializeFiles(newTask.attachments);
      
      addTask('todo', {
        title: newTask.title,
        description: newTask.description,
        assignee: newTask.assignee,
        priority: newTask.priority,
        attachments: serializedAttachments
      });
      
      setNewTask({
        title: '',
        description: '',
        assignee: '',
        priority: 'medium',
        attachments: []
      });
      setIsAddTaskOpen(false);
    }
  };

  const handleEditTask = async (task: any) => {
    if (editingTask) {
      const serializedAttachments = await serializeFiles(newTask.attachments);
      
      updateTask(task.id, {
        ...newTask,
        attachments: serializedAttachments
      });
      
      setEditingTask(null);
      setNewTask({
        title: '',
        description: '',
        assignee: '',
        priority: 'medium',
        attachments: []
      });
    }
  };

  const startEditing = (task: any) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      assignee: task.assignee || '',
      priority: task.priority || 'medium',
      attachments: []
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas tarefas e projetos</p>
        </div>
        
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Digite o título da tarefa"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Digite a descrição da tarefa"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignee">Responsável</Label>
                  <Input
                    id="assignee"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                    placeholder="Nome do responsável"
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={newTask.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="attachments">Anexos</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="w-full"
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Anexar Arquivos
                  </Button>
                  
                  {newTask.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {newTask.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            {getFileIcon(file.type)}
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddTask}>
                  Criar Tarefa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <Card key={column.id} className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                {column.title}
                <Badge variant="secondary">{column.tasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {column.tasks.map((task) => (
                <Card key={task.id} className="p-3 bg-white border shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(task)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-gray-600">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                      <Badge className={getStatusColor(column.id)} variant="secondary">
                        {column.title}
                      </Badge>
                    </div>
                    
                    {task.assignee && (
                      <p className="text-xs text-gray-500">👤 {task.assignee}</p>
                    )}
                    
                    {task.attachments && task.attachments.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">📎 Anexos:</p>
                        <div className="space-y-1">
                          {task.attachments.map((file: SerializedFile, index: number) => (
                            <FilePreview
                              key={index}
                              file={file}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              
              {column.tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Nenhuma tarefa</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-assignee">Responsável</Label>
                  <Input
                    id="edit-assignee"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-priority">Prioridade</Label>
                  <Select value={newTask.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingTask(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => handleEditTask(editingTask)}>
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
