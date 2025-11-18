-- Adicionar coluna de preço por hora na tabela machines
ALTER TABLE public.machines 
ADD COLUMN hourly_price DECIMAL(10,2);