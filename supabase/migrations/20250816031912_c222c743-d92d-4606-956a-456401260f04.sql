-- Adicionar campo column_order para ordenação das colunas
ALTER TABLE column_config 
ADD COLUMN column_order integer DEFAULT 0;

-- Atualizar ordem das colunas existentes baseado na data de criação
UPDATE column_config 
SET column_order = (
  SELECT row_number() OVER (PARTITION BY module ORDER BY created_at) 
  FROM column_config c2 
  WHERE c2.id = column_config.id
);