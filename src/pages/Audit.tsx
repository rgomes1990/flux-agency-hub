
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Search, Trash2, RefreshCw } from 'lucide-react';
import { useAuditData } from '@/hooks/useAuditData';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function Audit() {
  const { auditLogs, loading, refreshLogs, clearOldLogs } = useAuditData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearDialog, setShowClearDialog] = useState(false);

  const filteredLogs = auditLogs.filter(log => 
    log.user_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-500';
      case 'UPDATE': return 'bg-yellow-500';
      case 'DELETE': return 'bg-red-500';
      case 'LOGIN': return 'bg-blue-500';
      case 'LOGOUT': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const getTableDisplayName = (tableName: string) => {
    const tableMap: { [key: string]: string } = {
      'app_users': 'Usuários',
      'content': 'Conteúdo',
      'traffic': 'Tráfego',
      'tasks': 'Tarefas',
      'client_passwords': 'Senhas de Clientes',
      'auth': 'Autenticação'
    };
    return tableMap[tableName] || tableName;
  };

  const handleClearOldLogs = async () => {
    try {
      await clearOldLogs(30);
      setShowClearDialog(false);
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Auditoria do Sistema
          </h1>
          <p className="text-gray-600 mt-1">
            Monitore todas as atividades e modificações realizadas no sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshLogs} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            onClick={() => setShowClearDialog(true)} 
            variant="outline"
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Logs Antigos
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Logs de Auditoria ({filteredLogs.length})</span>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por usuário, tabela ou ação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tabela</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Registro ID</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {log.user_username || 'Sistema'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getTableDisplayName(log.table_name)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getActionColor(log.action)} text-white`}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.record_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {log.new_values && (
                        <div className="text-xs text-gray-600">
                          {Object.keys(log.new_values).slice(0, 2).join(', ')}
                          {Object.keys(log.new_values).length > 2 && '...'}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum log de auditoria encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleClearOldLogs}
        title="Limpar Logs Antigos"
        message="Tem certeza que deseja excluir todos os logs de auditoria com mais de 30 dias? Esta ação não pode ser desfeita."
        confirmText="Limpar"
      />
    </div>
  );
}
