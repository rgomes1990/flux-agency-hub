
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileImage, FileText, Download, X } from 'lucide-react';

interface FilePreviewProps {
  file: File | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilePreview({ file, open, onOpenChange }: FilePreviewProps) {
  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';
  const fileUrl = URL.createObjectURL(file);

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.name;
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
              <span>{file.name}</span>
            </DialogTitle>
            <div className="flex space-x-2">
              <Button onClick={downloadFile} variant="outline" size="sm">
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
          {isImage && (
            <img 
              src={fileUrl} 
              alt={file.name}
              className="max-w-full h-auto rounded-lg"
            />
          )}
          
          {isPDF && (
            <iframe
              src={fileUrl}
              width="100%"
              height="600px"
              className="border rounded-lg"
            />
          )}
          
          {!isImage && !isPDF && (
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
