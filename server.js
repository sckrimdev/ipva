import express from 'express'
import pg from 'pg'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())

// PostgreSQL connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
})

// Test DB connection on startup and ensure schema is up to date
pool.query('SELECT NOW()').then(async () => {
  console.log('PostgreSQL conectado com sucesso')
  // Add status columns if they don't exist
  try {
    await pool.query(`
      ALTER TABLE veiculos_rows 
      ADD COLUMN IF NOT EXISTS status_veiculo VARCHAR(20) DEFAULT 'ativo'
    `)
    await pool.query(`
      ALTER TABLE veiculos_rows 
      ADD COLUMN IF NOT EXISTS status_ipva VARCHAR(20) DEFAULT 'pendente'
    `)
    await pool.query(`
      ALTER TABLE veiculos_rows 
      ADD COLUMN IF NOT EXISTS status_licenciamento VARCHAR(20) DEFAULT 'pendente'
    `)
    console.log('Schema atualizado com sucesso')
  } catch (err) {
    console.error('Aviso ao atualizar schema:', err.message)
  }
}).catch(err => {
  console.error('Erro ao conectar ao PostgreSQL:', err.message)
})

// ============ API Routes ============

// GET /api/veiculos - Listar todos
app.get('/api/veiculos', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM veiculos_rows ORDER BY created_at DESC'
    )
    res.json(rows)
  } catch (err) {
    console.error('Erro ao buscar veículos:', err)
    res.status(500).json({ error: 'Erro ao buscar veículos' })
  }
})

// GET /api/veiculos/:id
app.get('/api/veiculos/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM veiculos_rows WHERE id = $1',
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Veículo não encontrado' })
    res.json(rows[0])
  } catch (err) {
    console.error('Erro ao buscar veículo:', err)
    res.status(500).json({ error: 'Erro ao buscar veículo' })
  }
})

// GET /api/veiculos/placa/:placa
app.get('/api/veiculos/placa/:placa', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM veiculos_rows WHERE placa_veiculo = $1',
      [req.params.placa]
    )
    if (rows.length === 0) return res.status(404).json(null)
    res.json(rows[0])
  } catch (err) {
    console.error('Erro ao buscar veículo por placa:', err)
    res.status(500).json({ error: 'Erro ao buscar veículo' })
  }
})

// GET /api/veiculos/estado/:estado
app.get('/api/veiculos/estado/:estado', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM veiculos_rows WHERE estado_veiculo = $1 ORDER BY placa_veiculo ASC',
      [req.params.estado]
    )
    res.json(rows)
  } catch (err) {
    console.error('Erro ao buscar veículos por estado:', err)
    res.status(500).json({ error: 'Erro ao buscar veículos' })
  }
})

// POST /api/veiculos
app.post('/api/veiculos', async (req, res) => {
  try {
    const {
      placa_veiculo, estado_veiculo, renavam_veiculo,
      tipo_veiculo, marca_veiculo, modelo_veiculo,
      ano_fabricacao, ano_modelo, valor_venal
    } = req.body

    const { rows } = await pool.query(
      `INSERT INTO veiculos_rows 
        (placa_veiculo, estado_veiculo, renavam_veiculo, tipo_veiculo, marca_veiculo, modelo_veiculo, ano_fabricacao, ano_modelo, valor_venal)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [placa_veiculo, estado_veiculo, renavam_veiculo, tipo_veiculo || 'tracao', marca_veiculo, modelo_veiculo, ano_fabricacao, ano_modelo, valor_venal || 0]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('Erro ao criar veículo:', err)
    res.status(500).json({ error: 'Erro ao criar veículo' })
  }
})

// PUT /api/veiculos/:id
app.put('/api/veiculos/:id', async (req, res) => {
  try {
    const fields = req.body
    const setClauses = []
    const values = []
    let i = 1

    for (const [key, value] of Object.entries(fields)) {
      setClauses.push(`${key} = $${i}`)
      values.push(value)
      i++
    }

    setClauses.push(`updated_at = NOW()`)
    values.push(req.params.id)

    const { rows } = await pool.query(
      `UPDATE veiculos_rows SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Veículo não encontrado' })
    res.json(rows[0])
  } catch (err) {
    console.error('Erro ao atualizar veículo:', err)
    res.status(500).json({ error: 'Erro ao atualizar veículo' })
  }
})

// DELETE /api/veiculos/:id
app.delete('/api/veiculos/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM veiculos_rows WHERE id = $1',
      [req.params.id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Veículo não encontrado' })
    res.json({ ok: true })
  } catch (err) {
    console.error('Erro ao deletar veículo:', err)
    res.status(500).json({ error: 'Erro ao deletar veículo' })
  }
})

// GET /api/veiculos/renavam/:renavam
app.get('/api/veiculos/renavam/:renavam', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM veiculos_rows WHERE renavam_veiculo = $1',
      [req.params.renavam]
    )
    if (rows.length === 0) return res.status(404).json(null)
    res.json(rows[0])
  } catch (err) {
    console.error('Erro ao buscar veículo por renavam:', err)
    res.status(500).json({ error: 'Erro ao buscar veículo' })
  }
})

// PATCH /api/veiculos/:id/status - Atualizar status do veículo
app.patch('/api/veiculos/:id/status', async (req, res) => {
  try {
    const { status_veiculo } = req.body
    if (!['ativo', 'vendido'].includes(status_veiculo)) {
      return res.status(400).json({ error: 'Status inválido. Use: ativo ou vendido' })
    }
    const { rows } = await pool.query(
      `UPDATE veiculos_rows
       SET status_veiculo = $1::text,
           status_ipva = CASE WHEN $1::text = 'vendido' THEN 'pago' ELSE status_ipva END,
           status_licenciamento = CASE WHEN $1::text = 'vendido' THEN 'pago' ELSE status_licenciamento END,
           updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [status_veiculo, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Veículo não encontrado' })
    res.json(rows[0])
  } catch (err) {
    console.error('Erro ao atualizar status:', err)
    res.status(500).json({ error: 'Erro ao atualizar status' })
  }
})

// PATCH /api/veiculos/:id/pagamento - Atualizar status de pagamento IPVA/Licenciamento
app.patch('/api/veiculos/:id/pagamento', async (req, res) => {
  try {
    const { campo, status } = req.body
    if (!['status_ipva', 'status_licenciamento'].includes(campo)) {
      return res.status(400).json({ error: 'Campo inválido. Use: status_ipva ou status_licenciamento' })
    }
    if (!['vencido', 'pendente', 'pago'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido. Use: vencido, pendente ou pago' })
    }
    const { rows } = await pool.query(
      `UPDATE veiculos_rows SET ${campo} = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Veículo não encontrado' })
    res.json(rows[0])
  } catch (err) {
    console.error('Erro ao atualizar pagamento:', err)
    res.status(500).json({ error: 'Erro ao atualizar pagamento' })
  }
})

// ============ Serve static frontend ============
app.use(express.static(path.join(__dirname, 'dist')))

// SPA fallback — all non-API routes serve index.html
app.get('/{path}', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
