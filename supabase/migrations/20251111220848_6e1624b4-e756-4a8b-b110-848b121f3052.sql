-- Alterar a coluna image para suportar múltiplas imagens
ALTER TABLE machines 
DROP COLUMN image;

ALTER TABLE machines 
ADD COLUMN images text[] DEFAULT '{}';

-- Adicionar comentário para documentação
COMMENT ON COLUMN machines.images IS 'Array de URLs das imagens da máquina (máximo 5)';