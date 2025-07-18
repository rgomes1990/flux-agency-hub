-- Remove duplicated content data, keeping only the first occurrence of each unique combination
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY group_id, item_data->>'elemento', item_data->>'servicos' 
           ORDER BY created_at
         ) as row_num
  FROM content_data
  WHERE (group_id, item_data->>'elemento', item_data->>'servicos') IN (
    SELECT group_id, item_data->>'elemento', item_data->>'servicos'
    FROM content_data 
    GROUP BY group_id, item_data->>'elemento', item_data->>'servicos' 
    HAVING COUNT(*) > 1
  )
)
DELETE FROM content_data 
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);