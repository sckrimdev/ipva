/**
 * Utilitário para calcular datas de vencimento de IPVA e Licenciamento
 * Regras específicas por estado para carretas/caminhões - Ano 2026
 * 
 * IMPORTANTE: Veículos de SP não possuem IPVA neste controle; apenas licenciamento.
 */

export interface VencimentoInfo {
  dataIPVA: Date | null
  dataLicenciamento: Date
  valorTaxaLicenciamento?: number
  observacoes: string
  statusIPVA: 'pendente' | 'proximo' | 'vencido' | 'pago' | 'isento'
  statusLicenciamento: 'pendente' | 'proximo' | 'vencido' | 'pago'
  diasParaIPVA: number | null
  diasParaLicenciamento: number
  isentoIPVA?: boolean
}

/**
 * Obtém o último dígito da placa (final da placa)
 */
export function getFinalPlaca(placa: string): number {
  const cleaned = placa.replace(/[^A-Za-z0-9]/g, '')
  const ultimoChar = cleaned.charAt(cleaned.length - 1)
  return parseInt(ultimoChar, 10) || 0
}

/**
 * Retorna o último dia útil de um mês (considerando apenas sábados e domingos)
 */
function getUltimoDiaUtilMes(ano: number, mes: number): Date {
  const ultimoDia = new Date(ano, mes + 1, 0) // Último dia do mês
  const diaSemana = ultimoDia.getDay()
  
  if (diaSemana === 0) { // Domingo
    ultimoDia.setDate(ultimoDia.getDate() - 2)
  } else if (diaSemana === 6) { // Sábado
    ultimoDia.setDate(ultimoDia.getDate() - 1)
  }
  
  return ultimoDia
}

/**
 * Calcula dias entre duas datas
 */
function calcularDiasRestantes(dataVencimento: Date): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const vencimento = new Date(dataVencimento)
  vencimento.setHours(0, 0, 0, 0)
  
  const diffTime = vencimento.getTime() - hoje.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Determina o status baseado nos dias restantes
 */
function determinarStatus(diasRestantes: number): 'pendente' | 'proximo' | 'vencido' {
  if (diasRestantes < 0) return 'vencido'
  if (diasRestantes <= 30) return 'proximo'
  return 'pendente'
}

/**
 * SP - São Paulo
 * Apenas licenciamento, com calendário específico por final de placa.
 */
function calcularVencimentosSP(finalPlaca: number): { ipva: null; licenciamento: Date; obs: string; isentoIPVA: boolean } {
  let licenciamento: Date
  let obs = 'SP: Apenas licenciamento.'
  
  switch (finalPlaca) {
    case 1:
    case 2:
      licenciamento = new Date(2026, 6, 31) // 31/jul
      obs += ` Licenciamento: Final ${finalPlaca} vence em 31/07.`
      break
    case 3:
    case 4:
    case 5:
      licenciamento = new Date(2026, 7, 31) // 31/ago
      obs += ` Licenciamento: Final ${finalPlaca} vence em 31/08.`
      break
    case 6:
    case 7:
    case 8:
      licenciamento = new Date(2026, 8, 30) // 30/set
      obs += ` Licenciamento: Final ${finalPlaca} vence em 30/09.`
      break
    case 9:
    case 0:
    default:
      licenciamento = new Date(2026, 10, 30) // 30/nov
      obs += ` Licenciamento: Final ${finalPlaca} vence em 30/11.`
      break
  }
  
  return { ipva: null, licenciamento, obs, isentoIPVA: true }
}

/**
 * GO - Goiás (Tração / Caminhão)
 * Pagamento unificado (IPVA + Licenciamento) no 2º semestre
 * Final 1 e 2: 15/09, Final 3 a 0: 15/10
 */
function calcularVencimentosGO(finalPlaca: number): { ipva: Date; licenciamento: Date; obs: string } {
  let dataUnificada: Date
  let obs: string
  
  if (finalPlaca === 1 || finalPlaca === 2) {
    dataUnificada = new Date(2026, 8, 15) // 15 de setembro
    obs = `GO: Pagamento unificado (IPVA + Licenciamento). Final ${finalPlaca} vence em 15/09/2026.`
  } else {
    dataUnificada = new Date(2026, 9, 15) // 15 de outubro
    obs = `GO: Pagamento unificado (IPVA + Licenciamento). Final ${finalPlaca} vence em 15/10/2026.`
  }
  
  return { ipva: dataUnificada, licenciamento: dataUnificada, obs }
}

/**
 * GO - Goiás (Carreta / Semi-reboque)
 * Carretas são ISENTAS de IPVA
 * Licenciamento segue o mesmo calendário unificado
 */
function calcularVencimentosGOCarreta(finalPlaca: number): { ipva: null; licenciamento: Date; obs: string; isentoIPVA: boolean } {
  let licenciamento: Date
  let obs: string
  
  if (finalPlaca === 1 || finalPlaca === 2) {
    licenciamento = new Date(2026, 8, 15) // 15 de setembro
    obs = `GO: Carretas ISENTAS de IPVA. Licenciamento: Final ${finalPlaca} vence em 15/09/2026.`
  } else {
    licenciamento = new Date(2026, 9, 15) // 15 de outubro
    obs = `GO: Carretas ISENTAS de IPVA. Licenciamento: Final ${finalPlaca} vence em 15/10/2026.`
  }
  
  return { ipva: null, licenciamento, obs, isentoIPVA: true }
}

/**
 * PR - Paraná
 * CARRETAS SÃO ISENTAS DE IPVA
 * Licenciamento: Taxa R$ 109,27
 * Prazos por final de placa
 */
function calcularVencimentosPR(finalPlaca: number): { ipva: null; licenciamento: Date; taxaLicenciamento: number; obs: string; isentoIPVA: boolean } {
  let licenciamento: Date
  let obs = 'PR: Carretas ISENTAS de IPVA. Taxa de licenciamento R$ 109,27.'
  
  switch (finalPlaca) {
    case 1:
      licenciamento = new Date(2026, 7, 14) // 14/ago
      obs += ` Final ${finalPlaca}: Licenciamento até 14/08.`
      break
    case 2:
      licenciamento = new Date(2026, 7, 28) // 28/ago
      obs += ` Final ${finalPlaca}: Licenciamento até 28/08.`
      break
    case 3:
      licenciamento = new Date(2026, 8, 9) // 09/set
      obs += ` Final ${finalPlaca}: Licenciamento até 09/09.`
      break
    case 4:
      licenciamento = new Date(2026, 8, 18) // 18/set
      obs += ` Final ${finalPlaca}: Licenciamento até 18/09.`
      break
    case 5:
      licenciamento = new Date(2026, 8, 28) // 28/set
      obs += ` Final ${finalPlaca}: Licenciamento até 28/09.`
      break
    case 6:
      licenciamento = new Date(2026, 9, 9) // 09/out
      obs += ` Final ${finalPlaca}: Licenciamento até 09/10.`
      break
    case 7:
      licenciamento = new Date(2026, 9, 20) // 20/out
      obs += ` Final ${finalPlaca}: Licenciamento até 20/10.`
      break
    case 8:
      licenciamento = new Date(2026, 9, 30) // 30/out
      obs += ` Final ${finalPlaca}: Licenciamento até 30/10.`
      break
    case 9:
      licenciamento = new Date(2026, 10, 13) // 13/nov
      obs += ` Final ${finalPlaca}: Licenciamento até 13/11.`
      break
    case 0:
    default:
      licenciamento = new Date(2026, 10, 27) // 27/nov
      obs += ` Final ${finalPlaca}: Licenciamento até 27/11.`
      break
  }
  
  return { ipva: null, licenciamento, taxaLicenciamento: 109.27, obs, isentoIPVA: true }
}

/**
 * SC - Santa Catarina
 * CARRETAS SÃO ISENTAS DE IPVA
 * Licenciamento: Baseado no final da placa. Taxa R$ 149,37
 */
function calcularVencimentosSC(finalPlaca: number): { ipva: null; licenciamento: Date; taxaLicenciamento: number; obs: string; isentoIPVA: boolean } {
  // Mês base do licenciamento = final da placa (1 = janeiro, 2 = fevereiro, etc. 0 = outubro)
  // Para carretas isentas de IPVA, o licenciamento segue o mesmo calendário
  const mesBase = finalPlaca === 0 ? 9 : finalPlaca - 1 // 0-indexed
  
  // Licenciamento = 2 meses após o mês base (mesmo cálculo anterior)
  const mesLicenciamento = (mesBase + 2) % 12
  const anoLicenciamento = mesBase + 2 >= 12 ? 2027 : 2026
  const licenciamento = getUltimoDiaUtilMes(anoLicenciamento, mesLicenciamento)
  
  const mesesNomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  
  const obs = `SC: Carretas ISENTAS de IPVA. ` +
              `Licenciamento (R$ 149,37) até último dia útil de ${mesesNomes[mesLicenciamento]}.`
  
  return { ipva: null, licenciamento, taxaLicenciamento: 149.37, obs, isentoIPVA: true }
}

/**
 * Função principal para calcular vencimentos baseado no estado e placa
 */
export function calcularVencimentos(estado: string, placa: string, tipoVeiculo?: string): VencimentoInfo {
  const finalPlaca = getFinalPlaca(placa)
  
  let dataIPVA: Date | null = null
  let dataLicenciamento: Date
  let valorTaxaLicenciamento: number | undefined
  let observacoes: string
  let isentoIPVA = false
  
  switch (estado.toUpperCase()) {
    case 'SP': {
      const sp = calcularVencimentosSP(finalPlaca)
      dataIPVA = sp.ipva
      dataLicenciamento = sp.licenciamento
      observacoes = sp.obs
      isentoIPVA = sp.isentoIPVA
      break
    }
    case 'GO': {
      const isCarreta = (tipoVeiculo || '').toLowerCase() === 'carreta'
      if (isCarreta) {
        const go = calcularVencimentosGOCarreta(finalPlaca)
        dataIPVA = go.ipva
        dataLicenciamento = go.licenciamento
        observacoes = go.obs
        isentoIPVA = go.isentoIPVA
      } else {
        const go = calcularVencimentosGO(finalPlaca)
        dataIPVA = go.ipva
        dataLicenciamento = go.licenciamento
        observacoes = go.obs
      }
      break
    }
    case 'PR': {
      const pr = calcularVencimentosPR(finalPlaca)
      dataIPVA = pr.ipva
      dataLicenciamento = pr.licenciamento
      valorTaxaLicenciamento = pr.taxaLicenciamento
      observacoes = pr.obs
      isentoIPVA = pr.isentoIPVA
      break
    }
    case 'SC': {
      const sc = calcularVencimentosSC(finalPlaca)
      dataIPVA = sc.ipva
      dataLicenciamento = sc.licenciamento
      valorTaxaLicenciamento = sc.taxaLicenciamento
      observacoes = sc.obs
      isentoIPVA = sc.isentoIPVA
      break
    }
    default: {
      // Estado não mapeado - usar regra genérica
      dataIPVA = new Date(2026, finalPlaca === 0 ? 9 : finalPlaca - 1, 15)
      dataLicenciamento = new Date(2026, finalPlaca === 0 ? 11 : (finalPlaca + 1), 15)
      observacoes = `Estado ${estado}: Regras específicas não cadastradas. Verifique no DETRAN local.`
      break
    }
  }
  
  const diasParaIPVA = dataIPVA ? calcularDiasRestantes(dataIPVA) : null
  const diasParaLicenciamento = calcularDiasRestantes(dataLicenciamento)
  
  return {
    dataIPVA,
    dataLicenciamento,
    valorTaxaLicenciamento,
    observacoes,
    statusIPVA: isentoIPVA ? 'isento' : (diasParaIPVA !== null ? determinarStatus(diasParaIPVA) : 'isento'),
    statusLicenciamento: determinarStatus(diasParaLicenciamento),
    diasParaIPVA,
    diasParaLicenciamento,
    isentoIPVA
  }
}

/**
 * Formata data para exibição
 */
export function formatarData(data: Date): string {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Formata data curta (dia/mês)
 */
export function formatarDataCurta(data: Date): string {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  })
}

/**
 * Retorna cor baseada no status
 */
export function getCorStatus(status: 'pendente' | 'proximo' | 'vencido' | 'pago' | 'isento'): {
  bg: string
  text: string
  border: string
} {
  switch (status) {
    case 'pago':
      return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
    case 'vencido':
      return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
    case 'proximo':
      return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' }
    case 'isento':
      return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' }
    case 'pendente':
    default:
      return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }
  }
}

/**
 * Agrupa veículos por urgência de vencimento
 */
export function agruparPorUrgencia<T extends { estado_veiculo: string; placa_veiculo: string; tipo_veiculo?: string }>(
  veiculos: T[]
): {
  vencidos: (T & { vencimento: VencimentoInfo })[]
  proximos: (T & { vencimento: VencimentoInfo })[]
  pendentes: (T & { vencimento: VencimentoInfo })[]
} {
  const resultado = {
    vencidos: [] as (T & { vencimento: VencimentoInfo })[],
    proximos: [] as (T & { vencimento: VencimentoInfo })[],
    pendentes: [] as (T & { vencimento: VencimentoInfo })[]
  }
  
  veiculos.forEach(veiculo => {
    const vencimento = calcularVencimentos(veiculo.estado_veiculo, veiculo.placa_veiculo, veiculo.tipo_veiculo)
    const veiculoComVencimento = { ...veiculo, vencimento }
    
    // Considera o vencimento mais próximo (IPVA ou Licenciamento)
    if (vencimento.statusIPVA === 'vencido' || vencimento.statusLicenciamento === 'vencido') {
      resultado.vencidos.push(veiculoComVencimento)
    } else if (vencimento.statusIPVA === 'proximo' || vencimento.statusLicenciamento === 'proximo') {
      resultado.proximos.push(veiculoComVencimento)
    } else {
      resultado.pendentes.push(veiculoComVencimento)
    }
  })
  
  // Ordenar por dias restantes (mais urgente primeiro)
  const ordenarPorUrgencia = (a: { vencimento: VencimentoInfo }, b: { vencimento: VencimentoInfo }) => {
    const diasA = Math.min(a.vencimento.diasParaIPVA ?? Infinity, a.vencimento.diasParaLicenciamento)
    const diasB = Math.min(b.vencimento.diasParaIPVA ?? Infinity, b.vencimento.diasParaLicenciamento)
    return diasA - diasB
  }
  
  resultado.vencidos.sort(ordenarPorUrgencia)
  resultado.proximos.sort(ordenarPorUrgencia)
  resultado.pendentes.sort(ordenarPorUrgencia)
  
  return resultado
}
