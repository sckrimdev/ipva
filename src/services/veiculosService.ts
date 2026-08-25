import type { VeiculoSupabase, VeiculoInsert, VeiculoUpdate } from '../types'

const API_BASE = '/api'

export const veiculosService = {
  // Buscar todos os veículos
  async getAll(): Promise<VeiculoSupabase[]> {
    const res = await fetch(`${API_BASE}/veiculos`)
    if (!res.ok) throw new Error('Erro ao buscar veículos')
    return res.json()
  },

  // Buscar veículo por ID
  async getById(id: string): Promise<VeiculoSupabase | null> {
    const res = await fetch(`${API_BASE}/veiculos/${id}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error('Erro ao buscar veículo')
    return res.json()
  },

  // Buscar veículo por placa
  async getByPlaca(placa: string): Promise<VeiculoSupabase | null> {
    const res = await fetch(`${API_BASE}/veiculos/placa/${encodeURIComponent(placa)}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error('Erro ao buscar veículo por placa')
    return res.json()
  },

  // Buscar veículos por estado
  async getByEstado(estado: string): Promise<VeiculoSupabase[]> {
    const res = await fetch(`${API_BASE}/veiculos/estado/${encodeURIComponent(estado)}`)
    if (!res.ok) throw new Error('Erro ao buscar veículos por estado')
    return res.json()
  },

  // Criar novo veículo
  async create(veiculo: VeiculoInsert): Promise<VeiculoSupabase> {
    const res = await fetch(`${API_BASE}/veiculos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(veiculo),
    })
    if (!res.ok) throw new Error('Erro ao criar veículo')
    return res.json()
  },

  // Atualizar veículo
  async update(id: string, veiculo: VeiculoUpdate): Promise<VeiculoSupabase> {
    const res = await fetch(`${API_BASE}/veiculos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(veiculo),
    })
    if (!res.ok) throw new Error('Erro ao atualizar veículo')
    return res.json()
  },

  // Deletar veículo
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/veiculos/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Erro ao deletar veículo')
  },

  // Buscar veículo por RENAVAM
  async getByRenavam(renavam: string): Promise<VeiculoSupabase | null> {
    const res = await fetch(`${API_BASE}/veiculos/renavam/${encodeURIComponent(renavam)}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error('Erro ao buscar veículo por renavam')
    return res.json()
  },

  // Atualizar status de pagamento (IPVA ou Licenciamento)
  async updatePagamento(id: string, campo: 'status_ipva' | 'status_licenciamento', status: string): Promise<VeiculoSupabase> {
    const res = await fetch(`${API_BASE}/veiculos/${id}/pagamento`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campo, status }),
    })
    if (!res.ok) throw new Error('Erro ao atualizar pagamento')
    return res.json()
  },

  // Atualizar status do veículo (ativo/vendido)
  async updateStatus(id: string, status_veiculo: string): Promise<VeiculoSupabase> {
    const res = await fetch(`${API_BASE}/veiculos/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status_veiculo }),
    })
    if (!res.ok) throw new Error('Erro ao atualizar status do veículo')
    return res.json()
  }
}
