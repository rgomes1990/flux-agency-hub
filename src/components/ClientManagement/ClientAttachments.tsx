
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Eye, Trash2, Upload, Loader2 } from 'lucide-react';
import { AttachmentViewer } from '@/components/AttachmentViewer';

interface ClientAttachmentsProps {
  clientId: string;
  onLoadAttachments: (clientId: string) => Promise<Array<{ name: string; data: string; type: string; size?: number }>>;
  attachments: Array<{
    name: string;
    path?: string;
    size?: number;
    type: string;
    data?: string;
  }>;
  onUpdateAttachments: (attachments: any[]) => void;
  onFileChange?: (file: File | null) => void;
}

export function ClientAttachments({ 
  clientId,
  onLoadAttachments,
  attachments, 
  onUpdateAttachments,
  onFileChange 
}: ClientAttachmentsProps) {
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const [attachmentsLoaded, setAttachmentsLoaded] = useState(false);

  // Carregar anexos sob demanda
  const loadAttachments = async () => {
    if (attachmentsLoaded || isLoadingAttachments) return;
    
    setIsLoadingAttachments(true);
    console.log('📎 Carregando anexos para cliente:', clientId);
    
    try {
      const loadedAttachments = await onLoadAttachments(clientId);
      onUpdateAttachments(loadedAttachments);
      setAttachmentsLoaded(true);
      console.log('✅ Anexos carregados:', loadedAttachments.length);
    } catch (error) {
      console.error('❌ Erro ao carregar anexos:', error);
    } finally {
      setIsLoadingAttachments(false);
    }
  };

  // Carregar anexos quando o componente é montado
  useEffect(() => {
    if (clientId && !attachmentsLoaded) {
      loadAttachments();
    }
  }, [clientId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Converter arquivo para base64 para preview imediato
    const reader = new FileReader();
    reader.onload = (e) => {
      const newAttachment = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: e.target?.result as string,
        isNew: true, // Marcar como novo para upload posterior
        file: file // Manter referência do arquivo para upload
      };

      const updatedAttachments = [...attachments, newAttachment];
      onUpdateAttachments(updatedAttachments);
    };
    reader.readAsDataURL(file);

    if (onFileChange) {
      onFileChange(file);
    }

    // Limpar o input
    event.target.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    console.log('🗑️ Removendo anexo no índice:', index);
    console.log('📎 Anexos antes da remoção:', attachments);
    console.log('📎 Anexo sendo removido:', attachments[index]);
    
    // Criar nova array sem o anexo removido
    const updatedAttachments = attachments.filter((_, i) => i !== index);
    
    console.log('📎 Anexos após remoção:', updatedAttachments);
    
    // Chamar a função de callback para atualizar os anexos
    onUpdateAttachments(updatedAttachments);
  };

  const handleViewAttachment = (attachment: any) => {
    setSelectedAttachment(attachment);
    setShowViewer(true);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Tamanho desconhecido';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">
          Anexos ({isLoadingAttachments ? '...' : attachments.length})
          {isLoadingAttachments && <Loader2 className="inline h-4 w-4 ml-2 animate-spin" />}
        </h4>
        <div>
          <input
            type="file"
            id={`file-upload-${clientId}`}
            className="hidden"
            onChange={handleFileSelect}
            accept="*/*"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => document.getElementById(`file-upload-${clientId}`)?.click()}
            disabled={isLoadingAttachments}
          >
            <Upload className="h-4 w-4 mr-2" />
            Adicionar Arquivo
          </Button>
        </div>
      </div>

      {isLoadingAttachments ? (
        <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-sm text-gray-500">Carregando anexos...</p>
        </div>
      ) : (
        <>
          {attachments.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {attachments.map((attachment, index) => (
                <div
                  key={`${attachment.name}-${index}`}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <Paperclip className="h-4 w-4 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.size)} • {attachment.type || 'Tipo desconhecido'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewAttachment(attachment)}
                      className="h-6 w-6 p-0"
                      title="Visualizar anexo"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveAttachment(index)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                      title="Remover anexo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {attachments.length === 0 && attachmentsLoaded && (
            <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nenhum arquivo anexado</p>
              <p className="text-xs text-gray-400">Clique em "Adicionar Arquivo" para anexar documentos</p>
            </div>
          )}
        </>
      )}

      <AttachmentViewer
        attachment={selectedAttachment}
        open={showViewer}
        onOpenChange={setShowViewer}
      />
    </div>
  );
}
