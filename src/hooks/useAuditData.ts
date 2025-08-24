
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_values?: any;
  new_values?: any;
  user_id?: string;
  user_username?: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export const useAuditData = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAuditLogs = async () => {
    try {
      console.log('🔄 Carregando logs de auditoria...');
      setLoading(true);

      // Aumentar significativamente o limite e ordenar melhor
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10000); // Aumentar limite para capturar mais logs

      if (error) {
        console.error('❌ Erro ao carregar logs de auditoria:', error);
        throw error;
      }

      console.log('✅ Logs de auditoria carregados:', data?.length || 0);

      // Verificar se temos logs de todas as tabelas esperadas
      const expectedTables = [
        'content_data', 'google_my_business_data', 'traffic_data', 
        'videos_data', 'rsg_avaliacoes_data', 'sites_data', 
        'content_padarias_data', 'tasks_data', 'client_passwords',
        'app_users', 'profiles'
      ];

      const tablesWithLogs = [...new Set((data || []).map(log => log.table_name))];
      console.log('📊 Tabelas com logs:', tablesWithLogs);
      console.log('📋 Tabelas esperadas:', expectedTables);

      const formattedLogs: AuditLog[] = (data || []).map(log => ({
        ...log,
        ip_address: log.ip_address ? String(log.ip_address) : undefined
      }));

      setAuditLogs(formattedLogs);
    } catch (error) {
      console.error('❌ Erro ao carregar logs de auditoria:', error);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const clearOldLogs = async (days: number = 30) => {
    try {
      console.log(`🔄 Limpando logs com mais de ${days} dias...`);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffISO = cutoffDate.toISOString();

      console.log('📅 Data de corte:', cutoffISO);

      // Contar logs que serão deletados
      const { count: countToDelete, error: countError } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .lt('timestamp', cutoffISO);

      if (countError) {
        console.error('❌ Erro ao contar logs para deletar:', countError);
        throw countError;
      }

      console.log(`📊 Logs que serão deletados: ${countToDelete || 0}`);

      if (!countToDelete || countToDelete === 0) {
        console.log('ℹ️ Nenhum log antigo encontrado para deletar');
        return 0;
      }

      // Executar a deleção
      const { error: deleteError } = await supabase
        .from('audit_logs')
        .delete()
        .lt('timestamp', cutoffISO);

      if (deleteError) {
        console.error('❌ Erro ao limpar logs antigos:', deleteError);
        throw deleteError;
      }

      console.log('✅ Logs antigos removidos com sucesso');
      
      // Recarregar os logs após a limpeza
      await loadAuditLogs();
      
      return countToDelete || 0;
    } catch (error) {
      console.error('❌ Erro ao limpar logs antigos:', error);
      throw error;
    }
  };

  // Nova função para criar backup de dados críticos
  const createDataBackup = async (tableName: string, data: any) => {
    try {
      console.log(`🛡️ Criando backup de segurança para ${tableName}...`);
      
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          table_name: tableName,
          record_id: `backup-${Date.now()}`,
          action: 'BACKUP',
          old_values: null,
          new_values: {
            backup_data: data,
            backup_timestamp: new Date().toISOString(),
            backup_size: Array.isArray(data) ? data.length : 1
          },
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Erro ao criar backup:', error);
        throw error;
      }

      console.log('✅ Backup criado com sucesso');
    } catch (error) {
      console.error('❌ Erro no sistema de backup:', error);
    }
  };

  const refreshLogs = async () => {
    await loadAuditLogs();
  };

  return {
    auditLogs,
    loading,
    refreshLogs,
    clearOldLogs,
    createDataBackup
  };
};
