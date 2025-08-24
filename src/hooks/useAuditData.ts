
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_values: any;
  new_values: any;
  user_id?: string;
  user_username?: string;
  user_agent?: string;
  ip_address?: string;
  timestamp: string;
}

export function useAuditData() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const loadAuditLogs = useCallback(async (limit = 1000) => {
    console.log('🔄 Carregando logs de auditoria...');
    setIsLoading(true);
    
    try {
      // Primeiro, obter contagem total
      const { count, error: countError } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('❌ Erro ao contar logs:', countError);
      } else {
        setTotalCount(count || 0);
        console.log('📊 Total de logs:', count);
      }

      // Então carregar os logs
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Erro ao carregar logs de auditoria:', error);
        throw error;
      }

      console.log('📋 Logs carregados:', data?.length || 0);
      setAuditLogs(data || []);

    } catch (error) {
      console.error('❌ Erro ao carregar logs de auditoria:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearOldLogs = useCallback(async (daysToKeep = 30) => {
    console.log(`🗑️ Limpando logs mais antigos que ${daysToKeep} dias...`);
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      console.log('📅 Data de corte:', cutoffDate.toISOString());

      const { data, error } = await supabase
        .from('audit_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString())
        .select('id');

      if (error) {
        console.error('❌ Erro ao limpar logs antigos:', error);
        throw error;
      }

      const deletedCount = data?.length || 0;
      console.log(`✅ ${deletedCount} logs antigos foram removidos`);

      // Recarregar logs após limpeza
      await loadAuditLogs();
      
      return deletedCount;

    } catch (error) {
      console.error('❌ Erro ao limpar logs antigos:', error);
      throw error;
    }
  }, [loadAuditLogs]);

  const getLogsByTable = useCallback(async (tableName: string) => {
    console.log('🔍 Buscando logs para tabela:', tableName);
    
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('table_name', tableName)
        .order('timestamp', { ascending: false })
        .limit(500);

      if (error) {
        console.error('❌ Erro ao buscar logs da tabela:', error);
        throw error;
      }

      console.log(`📋 Logs encontrados para ${tableName}:`, data?.length || 0);
      return data || [];

    } catch (error) {
      console.error('❌ Erro ao buscar logs da tabela:', error);
      return [];
    }
  }, []);

  const getLogsByDateRange = useCallback(async (startDate: string, endDate: string) => {
    console.log('📅 Buscando logs entre:', startDate, 'e', endDate);
    
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar logs por período:', error);
        throw error;
      }

      console.log('📋 Logs encontrados no período:', data?.length || 0);
      return data || [];

    } catch (error) {
      console.error('❌ Erro ao buscar logs por período:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  return {
    auditLogs,
    isLoading,
    totalCount,
    loadAuditLogs,
    clearOldLogs,
    getLogsByTable,
    getLogsByDateRange
  };
}
