-- Remove duplicate sites_data records, keeping only the oldest one for each client
-- This will help clean up duplicated clients in the sites module

WITH duplicates AS (
  SELECT 
    id,
    item_data->>'elemento' as elemento,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY item_data->>'elemento' 
      ORDER BY created_at ASC
    ) as rn
  FROM sites_data
  WHERE item_data->>'elemento' IS NOT NULL
    AND item_data->>'elemento' != ''
)
DELETE FROM sites_data 
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE rn > 1
);

-- Show the remaining records to verify cleanup
SELECT 
  item_data->>'elemento' as cliente,
  group_name,
  created_at,
  id
FROM sites_data 
ORDER BY item_data->>'elemento', created_at;