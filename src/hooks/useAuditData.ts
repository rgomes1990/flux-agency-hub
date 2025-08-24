
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
      console.log('Carregando logs de auditoria...');
      setLoading(true);

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5000); // Aumentar o limite para capturar mais logs

      if (error) {
        console.error('Erro ao carregar logs de auditoria:', error);
        throw error;
      }

      console.log('Logs de auditoria carregados:', data?.length || 0);

      // Converter os dados para o tipo correto
      const formattedLogs: AuditLog[] = (data || []).map(log => ({
        ...log,
        ip_address: log.ip_address ? String(log.ip_address) : undefined
      }));

      setAuditLogs(formattedLogs);
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
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
      console.log(`Limpando logs com mais de ${days} dias...`);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffISO = cutoffDate.toISOString();

      console.log('Data de corte:', cutoffISO);

      // Primeiro, verificar quantos logs serão deletados
      const { data: logsToDelete, error: countError } = await supabase
        .from('audit_logs')
        .select('id')
        .lt('timestamp', cutoffISO);

      if (countError) {
        console.error('Erro ao contar logs para deletar:', countError);
        throw countError;
      }

      console.log(`Logs que serão deletados: ${logsToDelete?.length || 0}`);

      // Executar a deleção
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .lt('timestamp', cutoffISO);

      if (error) {
        console.error('Erro ao limpar logs antigos:', error);
        throw error;
      }

      console.log('Logs antigos removidos com sucesso');
      
      // Recarregar os logs após a limpeza
      await loadAuditLogs();
      
      return logsToDelete?.length || 0;
    } catch (error) {
      console.error('Erro ao limpar logs antigos:', error);
      throw error;
    }
  };

  const refreshLogs = async () => {
    await loadAuditLogs();
  };

  return {
    auditLogs,
    loading,
    refreshLogs,
    clearOldLogs
  };
};
