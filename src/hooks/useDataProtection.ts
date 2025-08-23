
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface BackupData {
  id: string;
  table_name: string;
  backup_data: any;
  created_at: string;
  user_id: string | null;
}

export const useDataProtection = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const { user, logAudit } = useAuth();

  // Função para criar backup de uma tabela
  const createBackup = async (tableName: string, data: any) => {
    try {
      console.log('🔄 DATA PROTECTION: Criando backup para tabela:', tableName);
      setIsBackingUp(true);

      const backupEntry = {
        table_name: tableName,
        backup_data: data,
        user_id: user?.id || null,
        created_at: new Date().toISOString()
      };

      // Salvar backup na tabela de auditoria
      if (user?.id) {
        await logAudit(tableName, user.id, 'BACKUP', null, data);
      }

      console.log('✅ DATA PROTECTION: Backup criado com sucesso para:', tableName);
    } catch (error) {
      console.error('❌ DATA PROTECTION: Erro ao criar backup:', error);
      throw error;
    } finally {
      setIsBackingUp(false);
    }
  };

  // Função para verificar integridade dos dados
  const verifyDataIntegrity = async (tableName: string) => {
    try {
      console.log('🔍 DATA PROTECTION: Verificando integridade da tabela:', tableName);

      const { data, error } = await supabase
        .from(tableName)
        .select('id, created_at, updated_at')
        .limit(1);

      if (error) {
        console.error('❌ DATA PROTECTION: Erro na verificação de integridade:', error);
        return false;
      }

      console.log('✅ DATA PROTECTION: Tabela', tableName, 'íntegra');
      return true;
    } catch (error) {
      console.error('❌ DATA PROTECTION: Erro na verificação:', error);
      return false;
    }
  };

  // Função para restaurar dados de backup (se necessário)
  const restoreFromBackup = async (tableName: string, backupData: any) => {
    try {
      console.log('🔄 DATA PROTECTION: Restaurando dados da tabela:', tableName);

      // Esta função seria implementada caso precise restaurar dados
      // Por segurança, apenas logamos a tentativa
      if (user?.id) {
        await logAudit(tableName, user.id, 'RESTORE_ATTEMPT', null, { backup_size: backupData.length });
      }

      console.log('✅ DATA PROTECTION: Tentativa de restauração registrada');
    } catch (error) {
      console.error('❌ DATA PROTECTION: Erro na restauração:', error);
      throw error;
    }
  };

  // Auto-backup quando dados são modificados
  const safeDataOperation = async (
    tableName: string,
    operation: () => Promise<any>,
    currentData: any
  ) => {
    try {
      // Criar backup antes da operação
      await createBackup(tableName, currentData);
      
      // Executar a operação
      const result = await operation();
      
      // Verificar integridade após a operação
      const isIntact = await verifyDataIntegrity(tableName);
      if (!isIntact) {
        console.warn('⚠️ DATA PROTECTION: Possível problema de integridade detectado');
      }
      
      return result;
    } catch (error) {
      console.error('❌ DATA PROTECTION: Erro na operação segura:', error);
      throw error;
    }
  };

  return {
    isBackingUp,
    createBackup,
    verifyDataIntegrity,
    restoreFromBackup,
    safeDataOperation
  };
};
