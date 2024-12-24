/*
  # Criação da tabela de produtos
  
  1. Nova Tabela
    - `products`
      - `id` (uuid, chave primária)
      - `name` (texto, não nulo)
      - `price` (decimal, não nulo)
      - `quantity` (inteiro, não nulo)
      - `category` (texto, não nulo)
      - `created_at` (timestamp)

  2. Segurança
    - Habilita RLS na tabela `products`
    - Adiciona política para permitir leitura pública
    - Adiciona política para permitir inserção pública
*/

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  quantity integer NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública dos produtos"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserção pública de produtos"
  ON products
  FOR INSERT
  TO public
  WITH CHECK (true);