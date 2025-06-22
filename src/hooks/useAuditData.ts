
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
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Erro ao carregar logs de auditoria:', error);
        return;
      }

      // Converter os dados para o tipo correto
      const formattedLogs: AuditLog[] = (data || []).map(log => ({
        ...log,
        ip_address: log.ip_address ? String(log.ip_address) : undefined
      }));

      setAuditLogs(formattedLogs);
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const clearOldLogs = async (days: number = 30) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());

      if (error) {
        console.error('Erro ao limpar logs antigos:', error);
        throw error;
      }

      await loadAuditLogs();
    } catch (error) {
      console.error('Erro ao limpar logs antigos:', error);
      throw error;
    }
  };

  return {
    auditLogs,
    loading,
    refreshLogs: loadAuditLogs,
    clearOldLogs
  };
};
