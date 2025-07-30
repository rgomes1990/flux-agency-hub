-- Identificar e remover duplicações mais agressivamente
-- Primeiro, vamos manter apenas o registro mais antigo de cada cliente em cada grupo

WITH ranked_records AS (
  SELECT 
    id,
    item_data->>'elemento' as cliente_nome,
    group_id,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY item_data->>'elemento', group_id 
      ORDER BY created_at ASC
    ) as row_num
  FROM sites_data
  WHERE item_data->>'elemento' IS NOT NULL 
    AND item_data->>'elemento' != ''
)
DELETE FROM sites_data 
WHERE id IN (
  SELECT id 
  FROM ranked_records 
  WHERE row_num > 1
);

-- Agora vamos garantir que não há duplicação de clientes entre grupos diferentes
-- Se um cliente está em múltiplos grupos, manter apenas no grupo mais antigo
WITH client_across_groups AS (
  SELECT 
    id,
    item_data->>'elemento' as cliente_nome,
    group_id,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY item_data->>'elemento' 
      ORDER BY created_at ASC
    ) as row_num
  FROM sites_data
  WHERE item_data->>'elemento' IS NOT NULL 
    AND item_data->>'elemento' != ''
)
DELETE FROM sites_data 
WHERE id IN (
  SELECT id 
  FROM client_across_groups 
  WHERE row_num > 1
);

-- Verificar resultado final
SELECT 
  item_data->>'elemento' as cliente,
  group_name,
  created_at,
  id
FROM sites_data 
WHERE item_data->>'elemento' IS NOT NULL
ORDER BY item_data->>'elemento', created_at;