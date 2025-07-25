-- Remover novamente as duplicatas que voltaram a aparecer
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

DELETE FROM rsg_avaliacoes_data 
WHERE id IN (
  SELECT id 
  FROM records_to_delete 
  WHERE rn > 1
);

-- Verificar resultado
SELECT 
  COUNT(*) as total_registros,
  COUNT(DISTINCT (item_data->>'elemento')) as clientes_unicos
FROM rsg_avaliacoes_data 
WHERE group_id = 'group_1753149559383';