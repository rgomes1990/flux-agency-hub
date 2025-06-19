
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  type: 'Meta' | 'Google' | 'Sites' | 'Conteúdo' | 'Completo';
  status: 'Ativo' | 'Inativo' | 'Aguardando';
  credits: number;
  lastContact: Date;
  projects: Project[];
  campaigns: Campaign[];
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  type: 'Site Institucional' | 'E-commerce' | 'Landing Page' | 'Aplicativo';
  status: 'Planejamento' | 'Desenvolvimento' | 'Revisão' | 'Aprovação' | 'Finalizado';
  progress: number;
  startDate: Date;
  dueDate: Date;
  assignedTo: string;
  stages: ProjectStage[];
}

export interface ProjectStage {
  id: string;
  name: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Parado';
  assignedTo: string;
  dueDate: Date;
}

export interface Campaign {
  id: string;
  clientId: string;
  name: string;
  platform: 'Google Ads' | 'Meta Ads' | 'LinkedIn' | 'TikTok';
  status: 'Ativa' | 'Pausada' | 'Finalizada';
  budget: number;
  spent: number;
  startDate: Date;
  endDate?: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'Design' | 'Redação' | 'Desenvolvimento' | 'Gestão' | 'Tráfego';
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  status: 'A Fazer' | 'Em Andamento' | 'Revisão' | 'Concluído';
  assignedTo: string;
  clientId?: string;
  projectId?: string;
  dueDate: Date;
  createdAt: Date;
  comments: TaskComment[];
}

export interface TaskComment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Gerente' | 'Designer' | 'Redator' | 'Desenvolvedor' | 'Tráfego';
  avatar?: string;
}
