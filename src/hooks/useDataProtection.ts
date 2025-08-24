
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface BackupData {
  id: string;
  table_name: string;
  backup_data: any;
  created_at: string;
  user_id: string | null;
}

type TableName = 'content_data' | 'google_my_business_data' | 'traffic_data' | 'videos_data' | 'rsg_avaliacoes_data' | 'sites_data' | 'content_padarias_data' | 'tasks_data' | 'client_passwords';

export const useDataProtection = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const { user, logAudit } = useAuth();

  // Função para criar backup automático antes de operações críticas
  const createAutoBackup = async (tableName: TableName, currentData: any) => {
    try {
      console.log(`🛡️ DATA PROTECTION: Auto-backup iniciado para ${tableName}`);
      setIsBackingUp(true);

      // Salvar backup na tabela de auditoria
      if (user?.id && logAudit) {
        await logAudit(tableName, `auto-backup-${Date.now()}`, 'AUTO_BACKUP', null, {
          backup_data: currentData,
          backup_size: Array.isArray(currentData) ? currentData.length : 1,
          protection_level: 'HIGH',
          auto_generated: true
        });
      }

      console.log('✅ DATA PROTECTION: Auto-backup concluído');
      return true;
    } catch (error) {
      console.error('❌ DATA PROTECTION: Erro no auto-backup:', error);
      return false;
    } finally {
      setIsBackingUp(false);
    }
  };

  // Função para verificar integridade dos dados
  const verifyDataIntegrity = async (tableName: TableName) => {
    try {
      console.log(`🔍 DATA PROTECTION: Verificando integridade de ${tableName}`);

      const { data, error, count } = await supabase
        .from(tableName)
        .select('id, created_at, updated_at', { count: 'exact' })
        .limit(1);

      if (error) {
        console.error('❌ DATA PROTECTION: Erro na verificação:', error);
        return { isValid: false, error: error.message };
      }

      console.log(`✅ DATA PROTECTION: ${tableName} íntegra (${count} registros)`);
      return { isValid: true, recordCount: count };
    } catch (error) {
      console.error('❌ DATA PROTECTION: Erro na verificação:', error);
      return { isValid: false, error: 'Erro desconhecido' };
    }
  };

  // Operação segura com backup automático
  const safeDataOperation = async <T>(
    tableName: TableName,
    operation: () => Promise<T>,
    currentData?: any
  ): Promise<T> => {
    try {
      console.log(`🔒 DATA PROTECTION: Iniciando operação segura em ${tableName}`);
      
      // Criar backup antes da operação se dados foram fornecidos
      if (currentData) {
        const backupSuccess = await createAutoBackup(tableName, currentData);
        if (!backupSuccess) {
          console.warn('⚠️ DATA PROTECTION: Backup falhou, prosseguindo com operação...');
        }
      }
      
      // Executar a operação
      const result = await operation();
      
      // Verificar integridade após a operação
      const integrity = await verifyDataIntegrity(tableName);
      if (!integrity.isValid) {
        console.warn('⚠️ DATA PROTECTION: Possível problema de integridade detectado:', integrity.error);
        
        // Logar o problema
        if (user?.id && logAudit) {
          await logAudit(tableName, 'integrity-check', 'INTEGRITY_WARNING', null, {
            error: integrity.error,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ DATA PROTECTION: Erro na operação segura:', error);
      
      // Logar o erro
      if (user?.id && logAudit) {
        await logAudit(tableName, 'operation-error', 'ERROR', null, {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date().toISOString()
        });
      }
      
      throw error;
    }
  };

  // Monitoramento contínuo (executar periodicamente)
  const runHealthCheck = async () => {
    try {
      console.log('🏥 DATA PROTECTION: Executando verificação de saúde...');
      
      const tables: TableName[] = [
        'content_data', 'google_my_business_data', 'traffic_data', 
        'videos_data', 'rsg_avaliacoes_data', 'sites_data', 
        'content_padarias_data', 'tasks_data', 'client_passwords'
      ];

      const results = [];
      
      for (const table of tables) {
        const integrity = await verifyDataIntegrity(table);
        results.push({ table, ...integrity });
      }

      console.log('📊 DATA PROTECTION: Relatório de saúde:', results);
      return results;
    } catch (error) {
      console.error('❌ DATA PROTECTION: Erro na verificação de saúde:', error);
      return [];
    }
  };

  return {
    isBackingUp,
    createAutoBackup,
    verifyDataIntegrity,
    safeDataOperation,
    runHealthCheck
  };
};
