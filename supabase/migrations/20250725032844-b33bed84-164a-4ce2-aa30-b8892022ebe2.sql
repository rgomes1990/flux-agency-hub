-- Script para remover duplicatas da tabela rsg_avaliacoes_data
-- Mantém apenas o registro mais recente de cada cliente duplicado

-- Primeiro, vamos identificar os duplicados
WITH duplicated_clients AS (
  SELECT 
    (item_data->>'elemento') as cliente_nome,
    (item_data->>'servicos') as servicos,
    COUNT(*) as total_duplicatas
  FROM rsg_avaliacoes_data 
  WHERE group_id = 'group_1753149559383'
  GROUP BY (item_data->>'elemento'), (item_data->>'servicos')
  HAVING COUNT(*) > 1
),

-- Selecionar apenas os registros mais antigos para deletar (manter o mais recente)
records_to_delete AS (
  SELECT 
    r.id,
    ROW_NUMBER() OVER (
      PARTITION BY (r.item_data->>'elemento'), (r.item_data->>'servicos') 
      ORDER BY r.created_at DESC
    ) as rn
  FROM rsg_avaliacoes_data r
  INNER JOIN duplicated_clients d ON 
    (r.item_data->>'elemento') = d.cliente_nome AND
    (r.item_data->>'servicos') = d.servicos
  WHERE r.group_id = 'group_1753149559383'
)

-- Deletar todos os registros duplicados, exceto o mais recente (rn = 1)
DELETE FROM rsg_avaliacoes_data 
WHERE id IN (
  SELECT id 
  FROM records_to_delete 
  WHERE rn > 1
);

-- Verificar quantos registros restaram
SELECT 
  (item_data->>'elemento') as cliente_nome,
  COUNT(*) as quantidade_restante
FROM rsg_avaliacoes_data 
WHERE group_id = 'group_1753149559383'
GROUP BY (item_data->>'elemento')
ORDER BY cliente_nome;