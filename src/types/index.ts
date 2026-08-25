export type TipoVeiculo = 'tracao' | 'carreta'

export type Estado = 'SP' | 'PR' | 'SC' | 'RS'

export type StatusPagamento = 'pendente' | 'pago' | 'vencido' | 'proximo'

// Tipos para as tabelas do PostgreSQL
export interface VeiculoSupabase {
  id: string
  placa_veiculo: string
  estado_veiculo: string
  renavam_veiculo: string
  tipo_veiculo: string
  marca_veiculo: string | null
  modelo_veiculo: string | null
  ano_fabricacao: number | null
  ano_modelo: number | null
  valor_venal: number
  status_veiculo: string
  status_ipva: string
  status_licenciamento: string
  created_at: string
  updated_at: string
}

export interface IPVASupabase {
  id: string
  veiculo_id: string
  ano: number
  valor: number
  valor_pago: number
  parcelas: number
  parcela_atual: number
  data_vencimento: string
  data_pagamento: string | null
  status: string
  comprovante: string | null
  created_at: string
  updated_at: string
}

export interface LicenciamentoSupabase {
  id: string
  veiculo_id: string
  ano: number
  valor: number
  data_vencimento: string
  data_pagamento: string | null
  status: string
  crlv_emitido: boolean
  comprovante: string | null
  created_at: string
  updated_at: string
}

export type VeiculoInsert = Omit<VeiculoSupabase, 'id' | 'created_at' | 'updated_at'>
export type VeiculoUpdate = Partial<VeiculoInsert>

export interface Veiculo {
  id: string
  placa: string
  tipo: TipoVeiculo
  marca: string
  modelo: string
  anoFabricacao: number
  anoModelo: number
  renavam: string
  estado: Estado
  valorVenal: number
}

export interface IPVA {
  id: string
  veiculoId: string
  ano: number
  valor: number
  valorPago?: number
  parcelas: number
  parcelaAtual: number
  dataVencimento: string
  dataPagamento?: string
  status: StatusPagamento
  comprovante?: string
}

export interface Licenciamento {
  id: string
  veiculoId: string
  ano: number
  valor: number
  dataVencimento: string
  dataPagamento?: string
  status: StatusPagamento
  crlvEmitido: boolean
  comprovante?: string
}

// Regras de IPVA por estado (2026)
export const REGRAS_IPVA: Record<Estado, {
  aliquotaCaminhao: number
  parcelamento: number
  mesVencimentoBase: number
  descricao: string
}> = {
  SP: {
    aliquotaCaminhao: 1.5,
    parcelamento: 5,
    mesVencimentoBase: 1, // Janeiro
    descricao: 'IPVA: Data única 22/04/2026 para caminhões. Isento para carretas.'
  },
  PR: {
    aliquotaCaminhao: 1.0,
    parcelamento: 5,
    mesVencimentoBase: 1,
    descricao: 'Vencimento em Janeiro. Parcelável em até 5x. Desconto de 3% à vista.'
  },
  SC: {
    aliquotaCaminhao: 1.0,
    parcelamento: 3,
    mesVencimentoBase: 1,
    descricao: 'Vencimento pelo final da placa. Parcelável em até 3x.'
  },
  RS: {
    aliquotaCaminhao: 1.0,
    parcelamento: 6,
    mesVencimentoBase: 1,
    descricao: 'Vencimento em Janeiro. Parcelável em até 6x. Desconto de 6% à vista.'
  }
}

export const ESTADOS_INFO: Record<Estado, { nome: string; cor: string; bgColor: string }> = {
  SP: { nome: 'São Paulo', cor: 'text-red-600', bgColor: 'bg-red-50' },
  PR: { nome: 'Paraná', cor: 'text-blue-600', bgColor: 'bg-blue-50' },
  SC: { nome: 'Santa Catarina', cor: 'text-green-600', bgColor: 'bg-green-50' },
  RS: { nome: 'Rio Grande do Sul', cor: 'text-amber-600', bgColor: 'bg-amber-50' }
}
