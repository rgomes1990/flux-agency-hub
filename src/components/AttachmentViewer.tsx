
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface AttachmentViewerProps {
  attachment: {
    name: string;
    size: number;
    type: string;
    data: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttachmentViewer({ attachment, open, onOpenChange }: AttachmentViewerProps) {
  if (!attachment) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    link.click();
  };

  const isImage = attachment.type.startsWith('image/');
  const isPDF = attachment.type === 'application/pdf';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{attachment.name}</DialogTitle>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleDownload}>
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
          {isImage && (
            <img 
              src={attachment.data} 
              alt={attachment.name}
              className="max-w-full h-auto rounded-lg"
            />
          )}
          
          {isPDF && (
            <iframe
              src={attachment.data}
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
                Tipo: {attachment.type} | Tamanho: {(attachment.size / 1024).toFixed(1)} KB
              </p>
              <Button onClick={handleDownload} className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Baixar Arquivo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
