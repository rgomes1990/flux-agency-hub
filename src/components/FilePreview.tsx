
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileImage, FileText, Download, X } from 'lucide-react';

interface FilePreviewProps {
  file: File | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilePreview({ file, open, onOpenChange }: FilePreviewProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file && file instanceof File && file.size > 0) {
      try {
        const url = URL.createObjectURL(file);
        setFileUrl(url);
        
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error('Error creating object URL:', error);
        setFileUrl(null);
      }
    } else if (file && typeof file === 'object' && 'data' in file && 'name' in file) {
      // Handle serialized files from localStorage
      try {
        setFileUrl(file.data as string);
      } catch (error) {
        console.error('Error setting file URL:', error);
        setFileUrl(null);
      }
    } else {
      setFileUrl(null);
    }
  }, [file]);

  if (!file) return null;

  const isImage = file.type ? file.type.startsWith('image/') : 
    (typeof file === 'object' && 'type' in file && file.type?.startsWith('image/'));
  const isPDF = file.type === 'application/pdf' || 
    (typeof file === 'object' && 'type' in file && file.type === 'application/pdf');

  const downloadFile = () => {
    if (!fileUrl) return;
    
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.name || 'arquivo';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              {isImage ? <FileImage className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              <span className="truncate">{file.name || 'Arquivo'}</span>
            </DialogTitle>
            <div className="flex space-x-2">
              <Button onClick={downloadFile} variant="outline" size="sm" disabled={!fileUrl}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={() => onOpenChange(false)} variant="outline" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          {!fileUrl ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Erro ao carregar o arquivo</p>
              <p className="text-sm text-gray-500 mt-2">O arquivo pode estar corrompido ou inválido</p>
            </div>
          ) : isImage ? (
            <img 
              src={fileUrl} 
              alt={file.name || 'Imagem'}
              className="max-w-full h-auto rounded-lg"
            />
          ) : isPDF ? (
            <iframe
              src={fileUrl}
              width="100%"
              height="600px"
              className="border rounded-lg"
            />
          ) : (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Preview não disponível para este tipo de arquivo</p>
              <p className="text-sm text-gray-500 mt-2">Clique em Download para baixar o arquivo</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
