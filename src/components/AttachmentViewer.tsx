
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AttachmentViewerProps {
  attachment: {
    name: string;
    path?: string;
    size?: number;
    type: string;
    data?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttachmentViewer({ attachment, open, onOpenChange }: AttachmentViewerProps) {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadFileUrl = async () => {
      if (!attachment || !open) return;

      setIsLoading(true);
      
      try {
        // Se já tem data URL, usar diretamente
        if (attachment.data) {
          setFileUrl(attachment.data);
          return;
        }

        // Se tem path, buscar do storage
        if (attachment.path) {
          const { data, error } = await supabase.storage
            .from('client-files')
            .createSignedUrl(attachment.path, 3600);

          if (error) {
            console.error('Erro ao obter URL do arquivo:', error);
            return;
          }

          if (data?.signedUrl) {
            setFileUrl(data.signedUrl);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar arquivo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFileUrl();
  }, [attachment, open]);

  if (!attachment) return null;

  const handleDownload = async () => {
    if (!fileUrl) return;

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
    }
  };

  const isImage = attachment.type?.startsWith('image/') || attachment.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPDF = attachment.type === 'application/pdf' || attachment.name?.endsWith('.pdf');
  const fileSize = attachment.size ? (attachment.size / 1024).toFixed(1) : 'desconhecido';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{attachment.name}</DialogTitle>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleDownload} disabled={!fileUrl || isLoading}>
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
              <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="text-center p-8">
              <p className="text-gray-500">Carregando arquivo...</p>
            </div>
          ) : (
            <>
              {isImage && fileUrl && (
                <img 
                  src={fileUrl} 
                  alt={attachment.name}
                  className="max-w-full h-auto rounded-lg"
                />
              )}
              
              {isPDF && fileUrl && (
                <iframe
                  src={fileUrl}
                  className="w-full h-96 border rounded-lg"
                  title={attachment.name}
                />
              )}
              
              {!isImage && !isPDF && (
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">
                    Visualização não disponível para este tipo de arquivo.
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Tipo: {attachment.type || 'desconhecido'} | Tamanho: {fileSize} KB
                  </p>
                  <Button onClick={handleDownload} className="mt-4" disabled={!fileUrl}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Arquivo
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
