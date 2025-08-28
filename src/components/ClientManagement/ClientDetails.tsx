
import React from 'react';
import { ClientDetailsModal } from './ClientDetailsModal';

interface Observation {
  id: string;
  text: string;
  completed: boolean;
}

interface ClientDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  observations: Observation[];
  onUpdateObservations: (observations: Observation[]) => void;
  clientFile: File | null;
  onFileChange: (file: File | null) => void;
  onFilePreview?: (file: File) => void;
  availableGroups: Array<{ id: string; name: string }>;
  currentGroupId: string;
  onMoveClient: (newGroupId: string) => void;
  clientAttachments: Array<{
    name: string;
    path?: string;
    size?: number;
    type: string;
    data?: string;
  }>;
  onUpdateAttachments: (attachments: any[]) => void;
}

export function ClientDetails(props: ClientDetailsProps) {
  return <ClientDetailsModal {...props} />;
}
