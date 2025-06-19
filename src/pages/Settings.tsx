
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, User, Bell, Lock, Palette, Database } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-8 w-8 text-gray-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Gerencie as configurações da sua conta e sistema</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Perfil do Usuário */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>Perfil do Usuário</CardTitle>
            </div>
            <CardDescription>Atualize suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input id="fullName" defaultValue="Rogério Projetos" />
              </div>
              <div>
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input id="username" defaultValue="rogerio-projetos" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="rogerio-projetos@sistema.com" />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="(11) 99999-9999" />
            </div>
            <Button>Salvar Alterações</Button>
          </CardContent>
        </Card>

        {/* Configurações de Notificação */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notificações</CardTitle>
            </div>
            <CardDescription>Configure como e quando receber notificações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notificações por Email</h4>
                  <p className="text-sm text-gray-500">Receber atualizações por email</p>
                </div>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Prazos de Tarefas</h4>
                  <p className="text-sm text-gray-500">Alertas sobre prazos próximos</p>
                </div>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Novos Comentários</h4>
                  <p className="text-sm text-gray-500">Notificar sobre comentários em projetos</p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
            <Button>Salvar Preferências</Button>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Segurança</CardTitle>
            </div>
            <CardDescription>Gerencie a segurança da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <Button>Alterar Senha</Button>
          </CardContent>
        </Card>

        {/* Aparência */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Aparência</CardTitle>
            </div>
            <CardDescription>Personalize a interface do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tema</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <div className="border rounded-lg p-3 cursor-pointer hover:border-blue-500">
                  <div className="w-full h-8 bg-white border rounded mb-2"></div>
                  <p className="text-sm text-center">Claro</p>
                </div>
                <div className="border rounded-lg p-3 cursor-pointer hover:border-blue-500">
                  <div className="w-full h-8 bg-gray-800 rounded mb-2"></div>
                  <p className="text-sm text-center">Escuro</p>
                </div>
                <div className="border rounded-lg p-3 cursor-pointer hover:border-blue-500">
                  <div className="w-full h-8 bg-gradient-to-r from-white to-gray-800 rounded mb-2"></div>
                  <p className="text-sm text-center">Auto</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações da Empresa */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <CardTitle>Configurações da Empresa</CardTitle>
            </div>
            <CardDescription>Informações da sua agência</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input id="companyName" defaultValue="AgencyPro" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyPhone">Telefone</Label>
                <Input id="companyPhone" placeholder="(11) 3333-3333" />
              </div>
              <div>
                <Label htmlFor="companyEmail">Email Corporativo</Label>
                <Input id="companyEmail" type="email" placeholder="contato@agencypro.com" />
              </div>
            </div>
            <div>
              <Label htmlFor="companyAddress">Endereço</Label>
              <Input id="companyAddress" placeholder="Rua Exemplo, 123 - São Paulo, SP" />
            </div>
            <Button>Salvar Configurações</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
