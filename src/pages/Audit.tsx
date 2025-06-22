
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Calendar, User, Database } from 'lucide-react';
import { useAuditData } from '@/hooks/useAuditData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Audit() {
  const { auditLogs, loading, refreshLogs, clearOldLogs } = useAuditData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filterTable, setFilterTable] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTable = !filterTable || log.table_name === filterTable;
    const matchesAction = !filterAction || log.action === filterAction;
    
    return matchesSearch && matchesTable && matchesAction;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'LOGIN': return 'bg-blue-100 text-blue-800';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTableName = (tableName: string) => {
    const tableNames: { [key: string]: string } = {
      'traffic': 'Tráfego',
      'services': 'Serviços',
      'clients': 'Clientes',
      'auth': 'Autenticação',
      'content': 'Conteúdo',
      'tasks': 'Tarefas',
      'projects': 'Projetos'
    };
    return tableNames[tableName] || tableName;
  };

  const uniqueTables = [...new Set(auditLogs.map(log => log.table_name))];
  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];

  const handleClearOldLogs = async () => {
    if (confirm('Tem certeza que deseja limpar logs com mais de 30 dias?')) {
      try {
        await clearOldLogs(30);
        alert('Logs antigos removidos com sucesso!');
      } catch (error) {
        alert('Erro ao limpar logs antigos');
      }
    }
  };

  const viewLogDetails = (log: any) => {
    setSelectedLog(log);
    setShowDetailsDialog(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Carregando logs de auditoria...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auditoria do Sistema</h1>
          <p className="text-gray-600 mt-1">Controle e monitoramento de todas as alterações do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshLogs} variant="outline">
            <Database className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleClearOldLogs} variant="outline" className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Logs Antigos
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inserções</CardTitle>
            <Database className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => log.action === 'INSERT').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atualizações</CardTitle>
            <Database className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => log.action === 'UPDATE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exclusões</CardTitle>
            <Database className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => log.action === 'DELETE').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar por usuário, tabela ou ação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-3 py-2 border rounded-md"
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
            >
              <option value="">Todas as tabelas</option>
              {uniqueTables.map(table => (
                <option key={table} value={table}>{getTableName(table)}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border rounded-md"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="">Todas as ações</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setFilterTable('');
                setFilterAction('');
              }}
              variant="outline"
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria ({filteredLogs.length})</CardTitle>
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
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{log.user_username || 'Sistema'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTableName(log.table_name)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {log.record_id.substring(0, 8)}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewLogDetails(log)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Data/Hora</label>
                  <p className="text-sm bg-gray-50 p-2 rounded">
                    {format(new Date(selectedLog.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Usuário</label>
                  <p className="text-sm bg-gray-50 p-2 rounded">
                    {selectedLog.user_username || 'Sistema'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tabela</label>
                  <p className="text-sm bg-gray-50 p-2 rounded">
                    {getTableName(selectedLog.table_name)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Ação</label>
                  <p className="text-sm bg-gray-50 p-2 rounded">
                    <Badge className={getActionColor(selectedLog.action)}>
                      {selectedLog.action}
                    </Badge>
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">ID do Registro</label>
                <p className="text-sm bg-gray-50 p-2 rounded font-mono">
                  {selectedLog.record_id}
                </p>
              </div>

              {selectedLog.old_values && (
                <div>
                  <label className="text-sm font-medium">Valores Anteriores</label>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <label className="text-sm font-medium">Valores Novos</label>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.user_agent && (
                <div>
                  <label className="text-sm font-medium">User Agent</label>
                  <p className="text-xs bg-gray-50 p-2 rounded">
                    {selectedLog.user_agent}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
