-- Adicionar novas colunas na tabela veiculos
ALTER TABLE veiculos 
ADD COLUMN IF NOT EXISTS tipo_veiculo VARCHAR(20) DEFAULT 'tracao',
ADD COLUMN IF NOT EXISTS marca_veiculo VARCHAR(50),
ADD COLUMN IF NOT EXISTS modelo_veiculo VARCHAR(100),
ADD COLUMN IF NOT EXISTS ano_fabricacao INTEGER,
ADD COLUMN IF NOT EXISTS ano_modelo INTEGER,
ADD COLUMN IF NOT EXISTS valor_venal DECIMAL(12,2) DEFAULT 0;

-- Criar tabela de IPVA
CREATE TABLE IF NOT EXISTS ipva (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    veiculo_id UUID NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
    ano INTEGER NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    valor_pago DECIMAL(12,2) DEFAULT 0,
    parcelas INTEGER DEFAULT 1,
    parcela_atual INTEGER DEFAULT 1,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(20) DEFAULT 'pendente',
    comprovante TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(veiculo_id, ano)
);

-- Criar tabela de Licenciamento
CREATE TABLE IF NOT EXISTS licenciamento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    veiculo_id UUID NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
    ano INTEGER NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(20) DEFAULT 'pendente',
    crlv_emitido BOOLEAN DEFAULT FALSE,
    comprovante TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(veiculo_id, ano)
);

-- Índices para IPVA
CREATE INDEX IF NOT EXISTS idx_ipva_veiculo ON ipva(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_ipva_ano ON ipva(ano);
CREATE INDEX IF NOT EXISTS idx_ipva_status ON ipva(status);
CREATE INDEX IF NOT EXISTS idx_ipva_vencimento ON ipva(data_vencimento);

-- Índices para Licenciamento
CREATE INDEX IF NOT EXISTS idx_licenciamento_veiculo ON licenciamento(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_licenciamento_ano ON licenciamento(ano);
CREATE INDEX IF NOT EXISTS idx_licenciamento_status ON licenciamento(status);

-- RLS para IPVA
ALTER TABLE ipva ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública IPVA" ON ipva
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Permitir inserção pública IPVA" ON ipva
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização pública IPVA" ON ipva
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública IPVA" ON ipva
    FOR DELETE TO anon, authenticated USING (true);

-- RLS para Licenciamento
ALTER TABLE licenciamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública Licenciamento" ON licenciamento
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Permitir inserção pública Licenciamento" ON licenciamento
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização pública Licenciamento" ON licenciamento
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública Licenciamento" ON licenciamento
    FOR DELETE TO anon, authenticated USING (true);
