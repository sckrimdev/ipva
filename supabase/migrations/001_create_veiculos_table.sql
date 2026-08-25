-- Criação da tabela de veículos
CREATE TABLE IF NOT EXISTS veiculos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    placa_veiculo VARCHAR(10) NOT NULL UNIQUE,
    estado_veiculo VARCHAR(2) NOT NULL,
    renavam_veiculo VARCHAR(11) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance de buscas
CREATE INDEX IF NOT EXISTS idx_veiculos_placa ON veiculos(placa_veiculo);
CREATE INDEX IF NOT EXISTS idx_veiculos_estado ON veiculos(estado_veiculo);
CREATE INDEX IF NOT EXISTS idx_veiculos_renavam ON veiculos(renavam_veiculo);

-- Habilitar Row Level Security (RLS)
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (necessário para GitHub Pages)
CREATE POLICY "Permitir leitura pública" ON veiculos
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Política para permitir inserção pública
CREATE POLICY "Permitir inserção pública" ON veiculos
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Política para permitir atualização pública
CREATE POLICY "Permitir atualização pública" ON veiculos
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Política para permitir exclusão pública
CREATE POLICY "Permitir exclusão pública" ON veiculos
    FOR DELETE
    TO anon, authenticated
    USING (true);
