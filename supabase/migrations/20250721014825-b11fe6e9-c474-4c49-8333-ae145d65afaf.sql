-- Remove duplicados reais baseados em group_id e item_data->>'id'
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY group_id, item_data->>'id' 
           ORDER BY created_at
         ) as row_num
  FROM content_data
  WHERE item_data->>'id' IS NOT NULL
  AND (group_id, item_data->>'id') IN (
    SELECT group_id, item_data->>'id'
    FROM content_data 
    WHERE item_data->>'id' IS NOT NULL
    GROUP BY group_id, item_data->>'id' 
    HAVING COUNT(*) > 1
  )
)
DELETE FROM content_data 
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- Criar índices básicos para otimizar performance
CREATE INDEX IF NOT EXISTS idx_content_data_group_id ON content_data(group_id);
CREATE INDEX IF NOT EXISTS idx_content_data_created_at ON content_data(created_at);

-- Criar índice composto para queries específicas
CREATE INDEX IF NOT EXISTS idx_content_data_group_created ON content_data(group_id, created_at);