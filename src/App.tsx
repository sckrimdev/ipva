import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar, type ViewType } from '@/components/layout/Sidebar'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { useVeiculos } from '@/hooks/useVeiculos'
import { veiculosService } from '@/services/veiculosService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { 
  calcularVencimentos, 
  agruparPorUrgencia, 
  formatarData,
  getCorStatus,
  getFinalPlaca,
  type VencimentoInfo
} from '@/utils/vencimentos'
import type { VeiculoSupabase } from '@/types'
import { 
  Truck, 
  MapPin,
  Loader2,
  AlertCircle,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  Info,
  Search,
  X,
  ExternalLink,
  ArrowUpDown,
  Settings,
  Ban,
  RotateCcw,
  ClipboardCopy,
  Columns3,
  ChevronRight,
  ChevronLeft,
  GripVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const COLUNA_LABELS: Record<string, string> = { vencido: 'Vencido', pendente: 'Pendente', pago: 'Pago' }

const ESTADO_INFO: Record<string, { nome: string; cor: string; bgColor: string }> = {
  SP: { nome: 'São Paulo', cor: 'text-slate-700', bgColor: 'bg-slate-100' },
  PR: { nome: 'Paraná', cor: 'text-slate-700', bgColor: 'bg-slate-100' },
  SC: { nome: 'Santa Catarina', cor: 'text-slate-700', bgColor: 'bg-slate-100' },
  RS: { nome: 'Rio Grande do Sul', cor: 'text-slate-700', bgColor: 'bg-slate-100' },
  MG: { nome: 'Minas Gerais', cor: 'text-slate-700', bgColor: 'bg-slate-100' },
  RJ: { nome: 'Rio de Janeiro', cor: 'text-slate-700', bgColor: 'bg-slate-100' },
  BA: { nome: 'Bahia', cor: 'text-slate-700', bgColor: 'bg-slate-100' },
  GO: { nome: 'Goiás', cor: 'text-slate-700', bgColor: 'bg-slate-100' },
  MT: { nome: 'Mato Grosso', cor: 'text-slate-700', bgColor: 'bg-slate-100' },
  MS: { nome: 'Mato Grosso do Sul', cor: 'text-slate-700', bgColor: 'bg-slate-100' },
}

function formatPlaca(placa: string): string {
  return placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
}

function formatDiasRestantes(dias: number | null): string {
  if (dias === null) return 'Isento'
  if (dias < 0) return `${Math.abs(dias)} dias atrás`
  if (dias === 0) return 'Hoje!'
  if (dias === 1) return 'Amanhã'
  return `${dias} dias`
}

interface VeiculoComVencimento extends VeiculoSupabase {
  vencimento: VencimentoInfo
}

function calcularVencimentoVeiculo(veiculo: VeiculoSupabase): VencimentoInfo {
  const vencimento = calcularVencimentos(veiculo.estado_veiculo, veiculo.placa_veiculo, veiculo.tipo_veiculo)

  return {
    ...vencimento,
    statusIPVA: vencimento.isentoIPVA
      ? 'isento'
      : veiculo.status_ipva === 'pago'
        ? 'pago'
        : vencimento.statusIPVA,
    statusLicenciamento: veiculo.status_licenciamento === 'pago'
      ? 'pago'
      : vencimento.statusLicenciamento,
  }
}

function getDiasRelevantes(vencimento: VencimentoInfo): number {
  const diasIPVA = vencimento.isentoIPVA || vencimento.statusIPVA === 'pago'
    ? Infinity
    : vencimento.diasParaIPVA ?? Infinity
  const diasLicenciamento = vencimento.statusLicenciamento === 'pago'
    ? Infinity
    : vencimento.diasParaLicenciamento

  return Math.min(diasIPVA, diasLicenciamento)
}

function getDiasOrdenacao(vencimento: VencimentoInfo): number {
  return vencimento.isentoIPVA
    ? vencimento.diasParaLicenciamento
    : Math.min(vencimento.diasParaIPVA ?? Infinity, vencimento.diasParaLicenciamento)
}

function todosPagamentosResolvidos(vencimento: VencimentoInfo): boolean {
  return (vencimento.isentoIPVA || vencimento.statusIPVA === 'pago') && vencimento.statusLicenciamento === 'pago'
}

interface VeiculoCardCompletoProps {
  veiculo: VeiculoComVencimento
  isUpdating?: boolean
  onMarkAsPaid: (id: string, campo: 'status_ipva' | 'status_licenciamento') => void
}

function VeiculoCardCompleto({ veiculo, isUpdating = false, onMarkAsPaid }: VeiculoCardCompletoProps) {
  const info = ESTADO_INFO[veiculo.estado_veiculo] || { nome: veiculo.estado_veiculo, cor: 'text-slate-700', bgColor: 'bg-slate-100' }
  const { vencimento } = veiculo
  const finalPlaca = getFinalPlaca(veiculo.placa_veiculo)
  
  const coresIPVA = getCorStatus(vencimento.statusIPVA)
  const coresLic = getCorStatus(vencimento.statusLicenciamento)
  
  const diasRelevantes = getDiasRelevantes(vencimento)
  const pagamentosResolvidos = todosPagamentosResolvidos(vencimento)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <Truck className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg">
                  {formatPlaca(veiculo.placa_veiculo)}
                </span>
                <Badge className={`${info.bgColor} ${info.cor} border-0 text-xs`}>
                  {veiculo.estado_veiculo}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Final {finalPlaca} • RENAVAM: {veiculo.renavam_veiculo}
              </p>
            </div>
          </div>
          
          {/* Indicador de urgência */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            pagamentosResolvidos
              ? 'bg-green-100 text-green-700'
              : diasRelevantes < 0
              ? 'bg-red-100 text-red-700' 
              : diasRelevantes <= 30 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-green-100 text-green-700'
          }`}>
            {pagamentosResolvidos ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Pago
              </span>
            ) : diasRelevantes < 0 ? (
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Vencido
              </span>
            ) : diasRelevantes <= 7 ? (
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Urgente
              </span>
            ) : diasRelevantes <= 30 ? (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Próximo
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Em dia
              </span>
            )}
          </div>
        </div>
        
        {/* Vencimentos */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* IPVA */}
          <div className={`p-3 rounded-lg border ${coresIPVA.bg} ${coresIPVA.border}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <FileText className={`h-3.5 w-3.5 ${coresIPVA.text}`} />
              <span className={`text-xs font-semibold ${coresIPVA.text}`}>IPVA</span>
            </div>
            {vencimento.isentoIPVA ? (
              <>
                <p className={`text-sm font-bold ${coresIPVA.text}`}>ISENTO</p>
                <p className={`text-xs ${coresIPVA.text} opacity-75`}>Carreta</p>
              </>
            ) : (
              <>
                <p className={`text-sm font-bold ${coresIPVA.text}`}>
                  {vencimento.statusIPVA === 'pago' ? 'PAGO' : vencimento.dataIPVA ? formatarData(vencimento.dataIPVA) : '-'}
                </p>
                {vencimento.statusIPVA !== 'pago' && (
                  <>
                    <p className={`text-xs ${coresIPVA.text} opacity-75`}>
                      {formatDiasRestantes(vencimento.diasParaIPVA)}
                    </p>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onMarkAsPaid(veiculo.id, 'status_ipva')}
                      className="mt-2 w-full flex items-center justify-center gap-1 rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                      Marcar como pago
                    </button>
                  </>
                )}
              </>
            )}
          </div>
          
          {/* Licenciamento */}
          <div className={`p-3 rounded-lg border ${coresLic.bg} ${coresLic.border}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className={`h-3.5 w-3.5 ${coresLic.text}`} />
              <span className={`text-xs font-semibold ${coresLic.text}`}>Licenciamento</span>
            </div>
            <p className={`text-sm font-bold ${coresLic.text}`}>
              {vencimento.statusLicenciamento === 'pago' ? 'PAGO' : formatarData(vencimento.dataLicenciamento)}
            </p>
            <p className={`text-xs ${coresLic.text} opacity-75`}>
              {formatDiasRestantes(vencimento.diasParaLicenciamento)}
              {vencimento.valorTaxaLicenciamento && (
                <span className="ml-1">• R$ {vencimento.valorTaxaLicenciamento.toFixed(2)}</span>
              )}
            </p>
            {vencimento.statusLicenciamento !== 'pago' && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onMarkAsPaid(veiculo.id, 'status_licenciamento')}
                className="mt-2 w-full flex items-center justify-center gap-1 rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                Marcar como pago
              </button>
            )}
          </div>
        </div>
        
        {/* Observações */}
        <div className="mt-3 p-2 bg-slate-50 rounded-lg">
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            {vencimento.observacoes}
          </p>
        </div>
        
        {/* Botão PIX SEFAZ SP */}
        {veiculo.estado_veiculo === 'SP' && (
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => {
                navigator.clipboard.writeText(veiculo.renavam_veiculo)
                window.open('https://pixveiculos.fazenda.sp.gov.br/pix/home', '_blank')
              }}
            >
              <ExternalLink className="h-4 w-4" />
              PIX SEFAZ SP
            </Button>
          </div>
        )}

        {/* Botão DETRAN GO */}
        {veiculo.estado_veiculo === 'GO' && (
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
              onClick={() => {
                const placaSemTraco = veiculo.placa_veiculo.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
                navigator.clipboard.writeText(`${placaSemTraco} ${veiculo.renavam_veiculo}`)
                window.open('https://www.go.gov.br/servicos-digitais/detran/consulta-veiculos/detalhes-veiculo', '_blank')
              }}
            >
              <ClipboardCopy className="h-4 w-4" />
              DETRAN GO
            </Button>
          </div>
        )}

        {/* Botão DETRAN PR */}
        {veiculo.estado_veiculo === 'PR' && (
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              onClick={() => {
                const placaSemTraco = veiculo.placa_veiculo.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
                navigator.clipboard.writeText(`${placaSemTraco} ${veiculo.renavam_veiculo}`)
                window.open('https://www.extratodebito.detran.pr.gov.br/detranextratos/geraExtratoAutenticado.do?action=iniciarProcesso', '_blank')
              }}
            >
              <ClipboardCopy className="h-4 w-4" />
              DETRAN PR
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

type TabUrgencia = 'todos' | 'vencidos' | 'proximos' | 'em-dia'
type OrdenacaoVeiculos = 'vencimento-asc' | 'vencimento-desc' | 'placa-asc' | 'placa-desc'

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const [estadoTab, setEstadoTab] = useState<TabUrgencia>('todos')
  const [ordenacao, setOrdenacao] = useState<OrdenacaoVeiculos>('vencimento-asc')
  const [gerenciarSearch, setGerenciarSearch] = useState('')
  const [gerenciarFilter, setGerenciarFilter] = useState<'todos' | 'ativo' | 'vendido'>('todos')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [kanbanTipo, setKanbanTipo] = useState<'ipva' | 'licenciamento'>('ipva')
  const [kanbanUpdatingId, setKanbanUpdatingId] = useState<string | null>(null)
  const [kanbanEstado, setKanbanEstado] = useState('')
  const [kanbanVisibleCount, setKanbanVisibleCount] = useState<Record<string, number>>({ vencido: 15, pendente: 15, pago: 15 })
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)
  const [pendingDrop, setPendingDrop] = useState<{ id: string; placa: string; fromCol: string; toCol: string; campo: 'status_ipva' | 'status_licenciamento'; estado: string } | null>(null)
  const dragItemRef = useRef<{ id: string; fromCol: string } | null>(null)
  const { veiculos, loading, error, refetch, updateVeiculoLocal } = useVeiculos()

  // Resetar tab quando mudar de estado
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
    setEstadoTab('todos')
  }

  // Calcular vencimentos para todos os veículos (apenas ativos para vencimentos)
  const veiculosComVencimento = useMemo(() => {
    return veiculos
      .filter(v => (v.status_veiculo || 'ativo') !== 'vendido')
      .map(v => ({
        ...v,
        vencimento: calcularVencimentoVeiculo(v)
      }))
  }, [veiculos])

  // Lista de estados únicos para o filtro
  const estadosDisponiveis = useMemo(() => {
    const estados = [...new Set(veiculos.map(v => v.estado_veiculo))].filter(Boolean).sort()
    return estados
  }, [veiculos])

  // Auto-mover veículos para "vencido" quando a data passou
  useEffect(() => {
    if (veiculos.length === 0) return

    const autoMoveVencidos = async () => {
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      const updates: Promise<unknown>[] = []

      for (const v of veiculos) {
        if ((v.status_veiculo || 'ativo') === 'vendido') continue
        const venc = calcularVencimentos(v.estado_veiculo, v.placa_veiculo, v.tipo_veiculo)

        // IPVA vencido e não está marcado como vencido nem pago
        if (!venc.isentoIPVA && venc.dataIPVA && venc.diasParaIPVA !== null && venc.diasParaIPVA < 0) {
          const statusAtualIPVA = (v.status_ipva || 'pendente')
          if (statusAtualIPVA === 'pendente') {
            updates.push(veiculosService.updatePagamento(v.id, 'status_ipva', 'vencido'))
          }
        }

        // Licenciamento vencido e não está marcado como vencido nem pago
        if (venc.diasParaLicenciamento < 0) {
          const statusAtualLic = (v.status_licenciamento || 'pendente')
          if (statusAtualLic === 'pendente') {
            updates.push(veiculosService.updatePagamento(v.id, 'status_licenciamento', 'vencido'))
          }
        }
      }

      if (updates.length > 0) {
        await Promise.all(updates)
        await refetch()
      }
    }

    autoMoveVencidos()
  }, [veiculos.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Filtrar veículos
  const veiculosFiltrados = useMemo(() => {
    return veiculosComVencimento.filter(v => {
      const searchLower = searchTerm.toLowerCase()
      const matchSearch = !searchTerm || 
        v.placa_veiculo.toLowerCase().includes(searchLower) ||
        String(v.renavam_veiculo).toLowerCase().includes(searchLower) ||
        v.estado_veiculo.toLowerCase().includes(searchLower) ||
        (v.marca_veiculo && v.marca_veiculo.toLowerCase().includes(searchLower)) ||
        (v.modelo_veiculo && v.modelo_veiculo.toLowerCase().includes(searchLower))
      
      const matchEstado = !estadoFilter || v.estado_veiculo === estadoFilter
      
      return matchSearch && matchEstado
    })
  }, [veiculosComVencimento, searchTerm, estadoFilter])

  // Ordenar veículos filtrados
  const veiculosOrdenados = useMemo(() => {
    return [...veiculosFiltrados].sort((a, b) => {
      switch (ordenacao) {
        case 'vencimento-asc':
          return getDiasOrdenacao(a.vencimento) - getDiasOrdenacao(b.vencimento)
        case 'vencimento-desc':
          return getDiasOrdenacao(b.vencimento) - getDiasOrdenacao(a.vencimento)
        case 'placa-asc':
          return a.placa_veiculo.localeCompare(b.placa_veiculo)
        case 'placa-desc':
          return b.placa_veiculo.localeCompare(a.placa_veiculo)
        default:
          return 0
      }
    })
  }, [veiculosFiltrados, ordenacao])

  // Agrupar por urgência (apenas ativos)
  const veiculosAtivos = useMemo(() => {
    return veiculos.filter(v => (v.status_veiculo || 'ativo') !== 'vendido')
  }, [veiculos])

  const { vencidos, proximos, pendentes } = useMemo(() => {
    return agruparPorUrgencia(veiculosAtivos)
  }, [veiculosAtivos])

  // Agrupar por estado e urgência
  const estadosCounts = useMemo(() => {
    const counts: Record<string, { vencidos: number; proximos: number; emDia: number; total: number }> = {}
    
    veiculosComVencimento.forEach(v => {
      const estado = v.estado_veiculo
      if (!estado) return
      
      if (!counts[estado]) {
        counts[estado] = { vencidos: 0, proximos: 0, emDia: 0, total: 0 }
      }
      
      counts[estado].total++
      
      // Determinar dias relevantes (menor entre IPVA e Licenciamento)
      const diasRelevantes = getDiasRelevantes(v.vencimento)
      
      if (diasRelevantes < 0) {
        counts[estado].vencidos++
      } else if (diasRelevantes <= 30) {
        counts[estado].proximos++
      } else {
        counts[estado].emDia++
      }
    })
    
    return counts
  }, [veiculosComVencimento])

  const stats = useMemo(() => {
    const veiculosPorEstado = veiculosAtivos.reduce((acc, v) => {
      const estado = v.estado_veiculo || 'Outros'
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalVeiculos: veiculosAtivos.length,
      totalEstados: Object.keys(veiculosPorEstado).length,
      veiculosPorEstado,
      vencidos: vencidos.length,
      proximos: proximos.length,
      emDia: pendentes.length
    }
  }, [veiculosAtivos, vencidos, proximos, pendentes])

  const sidebarCounts = {
    veiculos: stats.totalVeiculos,
    vencidos: stats.vencidos,
    proximos: stats.proximos,
    emDia: stats.emDia
  }

  const renderLoading = () => (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-3 text-muted-foreground">Carregando dados...</span>
    </div>
  )

  const renderError = () => (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="flex items-center gap-3 p-6">
        <AlertCircle className="h-6 w-6 text-red-500" />
        <div>
          <p className="font-medium text-red-700">Erro ao carregar dados</p>
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={refetch}
            className="mt-2 text-sm text-red-700 underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      </CardContent>
    </Card>
  )

  const renderDashboard = () => {
    if (veiculos.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Truck className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Nenhum veículo cadastrado</p>
            <p className="text-sm text-muted-foreground/70">
              Adicione veículos no banco de dados
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-8">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Veículos"
            value={stats.totalVeiculos}
            subtitle="Cadastrados no sistema"
            icon={Truck}
            variant="primary"
          />
          <StatsCard
            title="Vencidos"
            value={stats.vencidos}
            subtitle="Precisam de atenção urgente"
            icon={AlertTriangle}
            variant="danger"
          />
          <StatsCard
            title="Vencendo em 30 dias"
            value={stats.proximos}
            subtitle="Ficar atento aos prazos"
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Em dia"
            value={stats.emDia}
            subtitle="Sem pendências próximas"
            icon={CheckCircle2}
            variant="success"
          />
        </div>

        {/* Resumo por estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Veículos por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.veiculosPorEstado).map(([estado, count]) => {
                const info = ESTADO_INFO[estado] || { nome: estado, cor: 'text-slate-700', bgColor: 'bg-slate-100' }
                return (
                  <Badge 
                    key={estado} 
                    className={`${info.bgColor} ${info.cor} border-0 px-3 py-1.5 text-sm`}
                  >
                    {estado}: {count} veículo{count !== 1 ? 's' : ''}
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legenda de regras */}
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-5 w-5" />
              Regras por Estado (2026)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-3 bg-white rounded-lg border">
                <h4 className="font-semibold text-blue-700 mb-1">SP - São Paulo</h4>
                <p className="text-muted-foreground text-xs">
                  <strong>IPVA:</strong> Data única 22/04/2026 para caminhões. Carretas ISENTAS ✓<br/>
                  <strong>Licenciamento:</strong> Final 1-2: 31/jul | Final 3-5: 31/ago | Final 6-8: 30/set | Final 9-0: 30/nov
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <h4 className="font-semibold text-emerald-700 mb-1">GO - Goiás</h4>
                <p className="text-muted-foreground text-xs">
                  <strong>Pagamento Unificado (Tração):</strong> IPVA + Licenciamento juntos. Carretas ISENTAS de IPVA ✓<br/>
                  Final 1-2: 15/09/2026 | Final 3-0: 15/10/2026
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <h4 className="font-semibold text-red-700 mb-1">PR - Paraná</h4>
                <p className="text-muted-foreground text-xs">
                  <strong>IPVA:</strong> Carretas ISENTAS ✓<br/>
                  <strong>Licenciamento (R$ 109,27):</strong><br/>
                  Final 1: 14/ago | 2: 28/ago | 3: 09/set | 4: 18/set | 5: 28/set | 6: 09/out | 7: 20/out | 8: 30/out | 9: 13/nov | 0: 27/nov
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <h4 className="font-semibold text-green-700 mb-1">SC - Santa Catarina</h4>
                <p className="text-muted-foreground text-xs">
                  <strong>IPVA:</strong> Carretas ISENTAS ✓<br/>
                  <strong>Licenciamento (R$ 149,37):</strong> 2 meses após o mês do final da placa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleToggleStatus = useCallback(async (id: string, currentStatus: string) => {
    const newStatus = (currentStatus || 'ativo') === 'ativo' ? 'vendido' : 'ativo'
    setUpdatingId(id)
    try {
      await veiculosService.updateStatus(id, newStatus)
      await refetch()
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    } finally {
      setUpdatingId(null)
    }
  }, [refetch])

  const handleMovePagamento = useCallback(async (id: string, campo: 'status_ipva' | 'status_licenciamento', novoStatus: string) => {
    setKanbanUpdatingId(id)
    try {
      // GO tem pagamento unificado: IPVA + Licenciamento juntos
      const veiculo = veiculos.find(v => v.id === id)
      if (!veiculo) return

      if (veiculo.estado_veiculo === 'GO') {
        await Promise.all([
          veiculosService.updatePagamento(id, 'status_ipva', novoStatus),
          veiculosService.updatePagamento(id, 'status_licenciamento', novoStatus),
        ])
        updateVeiculoLocal({
          ...veiculo,
          status_ipva: novoStatus,
          status_licenciamento: novoStatus,
        })
      } else {
        const veiculoAtualizado = await veiculosService.updatePagamento(id, campo, novoStatus)
        updateVeiculoLocal(veiculoAtualizado)
      }
    } catch (err) {
      console.error('Erro ao mover veículo:', err)
    } finally {
      setKanbanUpdatingId(null)
    }
  }, [updateVeiculoLocal, veiculos])

  const handleCardMarkAsPaid = useCallback((id: string, campo: 'status_ipva' | 'status_licenciamento') => {
    void handleMovePagamento(id, campo, 'pago')
  }, [handleMovePagamento])

  const handleConfirmDrop = async () => {
    if (!pendingDrop) return
    await handleMovePagamento(pendingDrop.id, pendingDrop.campo, pendingDrop.toCol)
    setPendingDrop(null)
  }

  const renderKanban = () => {
    const resetVisibleCount = () => setKanbanVisibleCount({ vencido: 15, pendente: 15, pago: 15 })
    const veiculosAtivosKanban = veiculos.filter(v => {
      if ((v.status_veiculo || 'ativo') === 'vendido') return false
      if (kanbanEstado && v.estado_veiculo !== kanbanEstado) return false
      return true
    })
    const campo: 'status_ipva' | 'status_licenciamento' = kanbanTipo === 'ipva' ? 'status_ipva' : 'status_licenciamento'

    // Calculate vencimentos for kanban cards
    const veiculosComInfo = veiculosAtivosKanban.map(v => ({
      ...v,
      vencimento: calcularVencimentos(v.estado_veiculo, v.placa_veiculo, v.tipo_veiculo)
    }))

    const colunas: { id: string; titulo: string; cor: string; bgHeader: string; bgCol: string; borderCol: string; dropBg: string; icon: typeof AlertTriangle }[] = [
      { id: 'vencido', titulo: 'Vencido', cor: 'text-red-700', bgHeader: 'bg-red-500', bgCol: 'bg-red-50', borderCol: 'border-red-200', dropBg: 'bg-red-100', icon: AlertTriangle },
      { id: 'pendente', titulo: 'Pendente', cor: 'text-amber-700', bgHeader: 'bg-amber-500', bgCol: 'bg-amber-50', borderCol: 'border-amber-200', dropBg: 'bg-amber-100', icon: Clock },
      { id: 'pago', titulo: 'Pago', cor: 'text-green-700', bgHeader: 'bg-green-500', bgCol: 'bg-green-50', borderCol: 'border-green-200', dropBg: 'bg-green-100', icon: CheckCircle2 },
    ]

    const veiculosPorColuna: Record<string, typeof veiculosComInfo> = {
      vencido: [],
      pendente: [],
      pago: [],
    }

    veiculosComInfo.forEach(v => {
      const status = (v[campo] as string) || 'pendente'
      if (veiculosPorColuna[status]) {
        veiculosPorColuna[status].push(v)
      } else {
        veiculosPorColuna['pendente'].push(v)
      }
    })

    // Drag handlers
    const onDragStart = (e: React.DragEvent, veiculoId: string, fromCol: string) => {
      dragItemRef.current = { id: veiculoId, fromCol }
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', veiculoId)
      // Make the dragged element semi-transparent
      const el = e.currentTarget as HTMLElement
      setTimeout(() => el.style.opacity = '0.4', 0)
    }

    const onDragEnd = (e: React.DragEvent) => {
      const el = e.currentTarget as HTMLElement
      el.style.opacity = '1'
      dragItemRef.current = null
      setDragOverCol(null)
    }

    const onDragOver = (e: React.DragEvent, colId: string) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      if (dragOverCol !== colId) setDragOverCol(colId)
    }

    const onDragLeave = (e: React.DragEvent, colId: string) => {
      // Only clear if leaving the column entirely (not entering a child)
      const relatedTarget = e.relatedTarget as HTMLElement
      const currentTarget = e.currentTarget as HTMLElement
      if (!currentTarget.contains(relatedTarget)) {
        if (dragOverCol === colId) setDragOverCol(null)
      }
    }

    const onDrop = (e: React.DragEvent, targetCol: string) => {
      e.preventDefault()
      setDragOverCol(null)
      const item = dragItemRef.current
      if (!item || item.fromCol === targetCol) {
        dragItemRef.current = null
        return
      }
      dragItemRef.current = null
      const veiculo = veiculosComInfo.find(v => v.id === item.id)
      if (!veiculo) return
      setPendingDrop({
        id: item.id,
        placa: veiculo.placa_veiculo,
        fromCol: item.fromCol,
        toCol: targetCol,
        campo,
        estado: veiculo.estado_veiculo
      })
    }

    const handleButtonMove = (id: string, placa: string, fromCol: string, toCol: string, estado: string) => {
      setPendingDrop({ id, placa, fromCol, toCol, campo, estado })
    }

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Columns3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">IPVA e Licenciamento</h1>
              <p className="text-muted-foreground">Arraste os veículos entre os status de pagamento</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Estado filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Select
                value={kanbanEstado}
                onChange={(e) => { setKanbanEstado(e.target.value); resetVisibleCount() }}
                className="pl-10 text-sm min-w-[160px]"
              >
                <option value="">Todos os estados</option>
                {estadosDisponiveis.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </Select>
            </div>

            {/* Toggle IPVA / Licenciamento */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => { setKanbanTipo('ipva'); resetVisibleCount() }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  kanbanTipo === 'ipva'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                IPVA
              </button>
              <button
                onClick={() => { setKanbanTipo('licenciamento'); resetVisibleCount() }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  kanbanTipo === 'licenciamento'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Licenciamento
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[60vh]">
          {colunas.map(coluna => {
            const veiculosColuna = veiculosPorColuna[coluna.id]
            const Icon = coluna.icon
            const isDragOver = dragOverCol === coluna.id
            return (
              <div
                key={coluna.id}
                onDragOver={(e) => onDragOver(e, coluna.id)}
                onDragLeave={(e) => onDragLeave(e, coluna.id)}
                onDrop={(e) => onDrop(e, coluna.id)}
                className={`flex flex-col rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                  isDragOver
                    ? `${coluna.dropBg} ${coluna.borderCol} scale-[1.02] shadow-lg`
                    : `${coluna.bgCol} ${coluna.borderCol}`
                }`}
              >
                {/* Column Header */}
                <div className={`${coluna.bgHeader} px-4 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-white" />
                    <span className="font-semibold text-white text-sm">{coluna.titulo}</span>
                  </div>
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {veiculosColuna.length}
                  </span>
                </div>

                {/* Drop zone indicator */}
                {isDragOver && (
                  <div className={`mx-3 mt-3 p-3 border-2 border-dashed rounded-lg text-center ${coluna.borderCol}`}>
                    <p className={`text-xs font-medium ${coluna.cor}`}>Soltar aqui</p>
                  </div>
                )}

                {/* Cards */}
                <div className="flex-1 p-3 space-y-3">
                  {veiculosColuna.length === 0 && !isDragOver ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Icon className={`h-8 w-8 ${coluna.cor} opacity-30 mb-2`} />
                      <p className={`text-xs ${coluna.cor} opacity-50`}>Nenhum veículo</p>
                    </div>
                  ) : (
                    <>
                    {veiculosColuna.slice(0, kanbanVisibleCount[coluna.id] || 15).map(veiculo => {
                      const info = ESTADO_INFO[veiculo.estado_veiculo] || { nome: veiculo.estado_veiculo, cor: 'text-slate-700', bgColor: 'bg-slate-100' }
                      const isUpdating = kanbanUpdatingId === veiculo.id
                      const colIdx = colunas.findIndex(c => c.id === coluna.id)
                      const canMoveLeft = colIdx > 0
                      const canMoveRight = colIdx < colunas.length - 1
                      const { vencimento } = veiculo
                      const finalPlaca = getFinalPlaca(veiculo.placa_veiculo)
                      const coresIPVA = getCorStatus(vencimento.statusIPVA)
                      const coresLic = getCorStatus(vencimento.statusLicenciamento)
                      const diasRelevantes = vencimento.isentoIPVA
                        ? vencimento.diasParaLicenciamento
                        : Math.min(vencimento.diasParaIPVA ?? Infinity, vencimento.diasParaLicenciamento)

                      return (
                        <div
                          key={veiculo.id}
                          draggable={!isUpdating}
                          onDragStart={(e) => onDragStart(e, veiculo.id, coluna.id)}
                          onDragEnd={onDragEnd}
                          className={`bg-white rounded-lg border shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          {/* Drag handle + header */}
                          <div className="flex items-start gap-2 p-3 pb-0">
                            <div className="pt-1 text-slate-300 hover:text-slate-500 transition-colors">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono font-bold text-sm">
                                    {formatPlaca(veiculo.placa_veiculo)}
                                  </span>
                                  <Badge className={`${info.bgColor} ${info.cor} border-0 text-[10px] px-1.5 py-0`}>
                                    {veiculo.estado_veiculo}
                                  </Badge>
                                </div>
                                {/* Urgency indicator */}
                                <div className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                                  diasRelevantes < 0
                                    ? 'bg-red-100 text-red-700'
                                    : diasRelevantes <= 30
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-green-100 text-green-700'
                                }`}>
                                  {diasRelevantes < 0 ? (
                                    <span className="flex items-center gap-0.5">
                                      <AlertTriangle className="h-2.5 w-2.5" />
                                      Vencido
                                    </span>
                                  ) : diasRelevantes <= 30 ? (
                                    <span className="flex items-center gap-0.5">
                                      <Clock className="h-2.5 w-2.5" />
                                      {formatDiasRestantes(diasRelevantes)}
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-0.5">
                                      <CheckCircle2 className="h-2.5 w-2.5" />
                                      Em dia
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Final {finalPlaca} • RENAVAM: {veiculo.renavam_veiculo}
                              </p>
                            </div>
                          </div>

                          {/* IPVA & Licenciamento boxes */}
                          <div className="grid grid-cols-2 gap-2 px-3 pt-2">
                            <div className={`p-2 rounded-md border ${coresIPVA.bg} ${coresIPVA.border}`}>
                              <div className="flex items-center gap-1 mb-0.5">
                                <FileText className={`h-3 w-3 ${coresIPVA.text}`} />
                                <span className={`text-[10px] font-semibold ${coresIPVA.text}`}>IPVA</span>
                              </div>
                              {vencimento.isentoIPVA ? (
                                <p className={`text-xs font-bold ${coresIPVA.text}`}>ISENTO</p>
                              ) : (
                                <>
                                  <p className={`text-xs font-bold ${coresIPVA.text}`}>
                                    {vencimento.dataIPVA ? formatarData(vencimento.dataIPVA) : '-'}
                                  </p>
                                  <p className={`text-[10px] ${coresIPVA.text} opacity-75`}>
                                    {formatDiasRestantes(vencimento.diasParaIPVA)}
                                  </p>
                                </>
                              )}
                            </div>
                            <div className={`p-2 rounded-md border ${coresLic.bg} ${coresLic.border}`}>
                              <div className="flex items-center gap-1 mb-0.5">
                                <Calendar className={`h-3 w-3 ${coresLic.text}`} />
                                <span className={`text-[10px] font-semibold ${coresLic.text}`}>Licenciamento</span>
                              </div>
                              <p className={`text-xs font-bold ${coresLic.text}`}>
                                {formatarData(vencimento.dataLicenciamento)}
                              </p>
                              <p className={`text-[10px] ${coresLic.text} opacity-75`}>
                                {formatDiasRestantes(vencimento.diasParaLicenciamento)}
                                {vencimento.valorTaxaLicenciamento && (
                                  <span className="ml-1">• R$ {vencimento.valorTaxaLicenciamento.toFixed(2)}</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Observações */}
                          <div className="mx-3 mt-2 p-1.5 bg-slate-50 rounded-md">
                            <p className="text-[10px] text-muted-foreground flex items-start gap-1">
                              <Info className="h-3 w-3 mt-0.5 shrink-0" />
                              <span className="line-clamp-2">{vencimento.observacoes}</span>
                            </p>
                          </div>

                          {/* GO unified payment indicator */}
                          {veiculo.estado_veiculo === 'GO' && (
                            <div className="mx-3 mt-1.5 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-[10px] text-blue-700 font-medium text-center">
                                Pagamento Unificado (IPVA + Licenciamento)
                              </p>
                            </div>
                          )}

                          {/* Botão DETRAN GO */}
                          {veiculo.estado_veiculo === 'GO' && (
                            <div className="mx-3 mt-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const placaSemTraco = veiculo.placa_veiculo.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
                                  navigator.clipboard.writeText(`${placaSemTraco} ${veiculo.renavam_veiculo}`)
                                  window.open('https://www.go.gov.br/servicos-digitais/detran/consulta-veiculos/detalhes-veiculo', '_blank')
                                }}
                                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors border border-emerald-200"
                              >
                                <ClipboardCopy className="h-3 w-3" />
                                DETRAN GO
                              </button>
                            </div>
                          )}

                          {/* Botão DETRAN PR */}
                          {veiculo.estado_veiculo === 'PR' && (
                            <div className="mx-3 mt-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const placaSemTraco = veiculo.placa_veiculo.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
                                  navigator.clipboard.writeText(`${placaSemTraco} ${veiculo.renavam_veiculo}`)
                                  window.open('https://www.extratodebito.detran.pr.gov.br/detranextratos/geraExtratoAutenticado.do?action=iniciarProcesso', '_blank')
                                }}
                                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors border border-red-200"
                              >
                                <ClipboardCopy className="h-3 w-3" />
                                DETRAN PR
                              </button>
                            </div>
                          )}

                          {/* Move buttons */}
                          <div className="p-3 pt-2 space-y-1.5">
                            {coluna.id !== 'pago' && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleButtonMove(veiculo.id, veiculo.placa_veiculo, coluna.id, 'pago', veiculo.estado_veiculo)}
                                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold bg-green-500 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                              >
                                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                Marcar como pago
                              </button>
                            )}
                            <div className="flex items-center gap-1">
                            {canMoveLeft && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleButtonMove(veiculo.id, veiculo.placa_veiculo, coluna.id, colunas[colIdx - 1].id, veiculo.estado_veiculo)}
                                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors
                                  ${colunas[colIdx - 1].id === 'vencido' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                                  ${colunas[colIdx - 1].id === 'pendente' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : ''}
                                  ${colunas[colIdx - 1].id === 'pago' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                                `}
                              >
                                {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronLeft className="h-3 w-3" />}
                                {colunas[colIdx - 1].titulo}
                              </button>
                            )}
                            {canMoveRight && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleButtonMove(veiculo.id, veiculo.placa_veiculo, coluna.id, colunas[colIdx + 1].id, veiculo.estado_veiculo)}
                                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors
                                  ${colunas[colIdx + 1].id === 'vencido' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                                  ${colunas[colIdx + 1].id === 'pendente' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : ''}
                                  ${colunas[colIdx + 1].id === 'pago' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                                `}
                              >
                                {colunas[colIdx + 1].titulo}
                                {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronRight className="h-3 w-3" />}
                              </button>
                            )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {/* Load more sentinel - auto loads via IntersectionObserver */}
                    {(kanbanVisibleCount[coluna.id] || 15) < veiculosColuna.length && (
                      <div
                        className="py-2"
                        ref={(el) => {
                          if (!el) return
                          const colId = coluna.id
                          const observer = new IntersectionObserver(
                            (entries) => {
                              if (entries[0].isIntersecting) {
                                setKanbanVisibleCount(prev => ({ ...prev, [colId]: (prev[colId] || 15) + 15 }))
                              }
                            },
                            { rootMargin: '200px' }
                          )
                          observer.observe(el)
                          // Cleanup on unmount
                          ;(el as any).__kanbanObserver?.disconnect()
                          ;(el as any).__kanbanObserver = observer
                        }}
                      >
                        <div className={`w-full py-3 flex items-center justify-center gap-2 rounded-lg text-xs font-medium ${coluna.bgCol} ${coluna.cor} border ${coluna.borderCol}`}>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Carregando mais... ({veiculosColuna.length - (kanbanVisibleCount[coluna.id] || 15)} restantes)
                        </div>
                      </div>
                    )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderGerenciar = () => {
    const veiculosFiltradosGerenciar = veiculos.filter(v => {
      const searchLower = gerenciarSearch.toLowerCase()
      const matchSearch = !gerenciarSearch ||
        v.placa_veiculo.toLowerCase().includes(searchLower) ||
        String(v.renavam_veiculo).toLowerCase().includes(searchLower) ||
        v.estado_veiculo.toLowerCase().includes(searchLower) ||
        (v.marca_veiculo && v.marca_veiculo.toLowerCase().includes(searchLower)) ||
        (v.modelo_veiculo && v.modelo_veiculo.toLowerCase().includes(searchLower))

      const status = v.status_veiculo || 'ativo'
      const matchStatus = gerenciarFilter === 'todos' || status === gerenciarFilter

      return matchSearch && matchStatus
    })

    const totalAtivos = veiculos.filter(v => (v.status_veiculo || 'ativo') === 'ativo').length
    const totalVendidos = veiculos.filter(v => v.status_veiculo === 'vendido').length

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Settings className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Gerenciar Frota</h1>
              <p className="text-muted-foreground">Gerencie o status dos veículos da frota</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-700 border-0">{totalAtivos} ativos</Badge>
            <Badge className="bg-red-100 text-red-700 border-0">{totalVendidos} vendidos</Badge>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por placa, RENAVAM, marca, modelo..."
                  value={gerenciarSearch}
                  onChange={(e) => setGerenciarSearch(e.target.value)}
                  className="pl-10"
                />
                {gerenciarSearch && (
                  <button
                    onClick={() => setGerenciarSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="sm:w-48">
                <Select
                  value={gerenciarFilter}
                  onChange={(e) => setGerenciarFilter(e.target.value as 'todos' | 'ativo' | 'vendido')}
                >
                  <option value="todos">Todos ({veiculos.length})</option>
                  <option value="ativo">Ativos ({totalAtivos})</option>
                  <option value="vendido">Vendidos ({totalVendidos})</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de veículos */}
        {veiculosFiltradosGerenciar.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum veículo encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {veiculosFiltradosGerenciar.map(veiculo => {
              const status = veiculo.status_veiculo || 'ativo'
              const isVendido = status === 'vendido'
              const isUpdating = updatingId === veiculo.id
              const info = ESTADO_INFO[veiculo.estado_veiculo] || { nome: veiculo.estado_veiculo, cor: 'text-slate-700', bgColor: 'bg-slate-100' }

              return (
                <Card key={veiculo.id} className={`transition-all ${isVendido ? 'opacity-70 bg-slate-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${isVendido ? 'bg-red-100' : 'bg-green-100'}`}>
                          <Truck className={`h-5 w-5 ${isVendido ? 'text-red-500' : 'text-green-600'}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-lg">
                              {formatPlaca(veiculo.placa_veiculo)}
                            </span>
                            <Badge className={`${info.bgColor} ${info.cor} border-0 text-xs`}>
                              {veiculo.estado_veiculo}
                            </Badge>
                            <Badge className={`border-0 text-xs ${
                              isVendido 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {isVendido ? 'Vendido' : 'Ativo'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {veiculo.marca_veiculo && veiculo.modelo_veiculo
                              ? `${veiculo.marca_veiculo} ${veiculo.modelo_veiculo} • `
                              : ''
                            }
                            RENAVAM: {veiculo.renavam_veiculo}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleToggleStatus(veiculo.id, status)}
                        className={`shrink-0 gap-2 ${
                          isVendido
                            ? 'text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300'
                            : 'text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300'
                        }`}
                      >
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isVendido ? (
                          <RotateCcw className="h-4 w-4" />
                        ) : (
                          <Ban className="h-4 w-4" />
                        )}
                        {isVendido ? 'Reativar' : 'Marcar como Vendido'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const renderContent = () => {
    if (loading) return renderLoading()
    if (error) return renderError()

    switch (currentView) {
      case 'kanban':
        return renderKanban()

      case 'gerenciar':
        return renderGerenciar()

      case 'dashboard':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard de Vencimentos</h1>
                <p className="text-muted-foreground">Controle de IPVA e Licenciamento da frota</p>
              </div>
              <button 
                onClick={refetch}
                className="text-sm text-primary hover:underline"
              >
                Atualizar dados
              </button>
            </div>
            {renderDashboard()}
          </div>
        )

      case 'veiculos':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Todos os Veículos</h1>
                <p className="text-muted-foreground">Veículos organizados por estado</p>
              </div>
              <Badge variant="secondary">{veiculosOrdenados.length} de {stats.totalVeiculos} veículos</Badge>
            </div>
            
            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por placa, RENAVAM, marca, modelo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="sm:w-48">
                    <Select
                      value={estadoFilter}
                      onChange={(e) => setEstadoFilter(e.target.value)}
                    >
                      <option value="">Todos os estados</option>
                      {estadosDisponiveis.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="sm:w-64">
                    <div className="relative">
                      <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Select
                        value={ordenacao}
                        onChange={(e) => setOrdenacao(e.target.value as OrdenacaoVeiculos)}
                        className="pl-10"
                      >
                        <option value="vencimento-asc">Vencimento: mais próximo</option>
                        <option value="vencimento-desc">Vencimento: mais distante</option>
                        <option value="placa-asc">Placa: A-Z</option>
                        <option value="placa-desc">Placa: Z-A</option>
                      </Select>
                    </div>
                  </div>
                  {(searchTerm || estadoFilter) && (
                    <button
                      onClick={() => { setSearchTerm(''); setEstadoFilter(''); }}
                      className="text-sm text-primary hover:underline whitespace-nowrap"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            {veiculos.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <Truck className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhum veículo cadastrado</p>
                </CardContent>
              </Card>
            ) : veiculosOrdenados.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhum veículo encontrado</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Tente ajustar os filtros de busca</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {veiculosOrdenados.map(veiculo => (
                  <VeiculoCardCompleto
                    key={veiculo.id}
                    veiculo={veiculo}
                    isUpdating={kanbanUpdatingId === veiculo.id}
                    onMarkAsPaid={handleCardMarkAsPaid}
                  />
                ))}
              </div>
            )}
          </div>
        )

      default:
        // Verificar se é uma view de estado (estado-XX)
        if (currentView.startsWith('estado-')) {
          const estado = currentView.replace('estado-', '')
          const counts = estadosCounts[estado] || { vencidos: 0, proximos: 0, emDia: 0, total: 0 }
          
          // Filtrar veículos do estado
          const veiculosDoEstado = veiculosComVencimento.filter(v => v.estado_veiculo === estado)
          
          // Filtrar por tab selecionada
          const veiculosFiltradosPorTab = veiculosDoEstado.filter(v => {
            if (estadoTab === 'todos') return true
            
            const diasRelevantes = getDiasRelevantes(v.vencimento)
            
            if (estadoTab === 'vencidos') return diasRelevantes < 0
            if (estadoTab === 'proximos') return diasRelevantes >= 0 && diasRelevantes <= 30
            return diasRelevantes > 30
          })
          
          // Ordenar veículos do estado
          const veiculosOrdenadosPorTab = [...veiculosFiltradosPorTab].sort((a, b) => {
            switch (ordenacao) {
              case 'vencimento-asc':
                return getDiasOrdenacao(a.vencimento) - getDiasOrdenacao(b.vencimento)
              case 'vencimento-desc':
                return getDiasOrdenacao(b.vencimento) - getDiasOrdenacao(a.vencimento)
              case 'placa-asc':
                return a.placa_veiculo.localeCompare(b.placa_veiculo)
              case 'placa-desc':
                return b.placa_veiculo.localeCompare(a.placa_veiculo)
              default:
                return 0
            }
          })
          
          const ESTADO_NOMES: Record<string, string> = {
            SP: 'São Paulo',
            PR: 'Paraná',
            SC: 'Santa Catarina',
            GO: 'Goiás',
            RS: 'Rio Grande do Sul',
            MG: 'Minas Gerais',
            RJ: 'Rio de Janeiro',
            BA: 'Bahia',
            MT: 'Mato Grosso',
            MS: 'Mato Grosso do Sul',
          }
          
          const tabs: { id: TabUrgencia; label: string; count: number; color: string; bgColor: string; activeColor: string }[] = [
            { id: 'todos', label: 'Todos', count: counts.total, color: 'text-slate-600', bgColor: 'bg-slate-100', activeColor: 'bg-slate-600' },
            { id: 'vencidos', label: 'Vencidos', count: counts.vencidos, color: 'text-red-600', bgColor: 'bg-red-100', activeColor: 'bg-red-600' },
            { id: 'proximos', label: 'Vencendo em 30 dias', count: counts.proximos, color: 'text-amber-600', bgColor: 'bg-amber-100', activeColor: 'bg-amber-600' },
            { id: 'em-dia', label: 'Em dia', count: counts.emDia, color: 'text-green-600', bgColor: 'bg-green-100', activeColor: 'bg-green-600' },
          ]
          
          return (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <MapPin className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {ESTADO_NOMES[estado] || estado}
                  </h2>
                  <p className="text-muted-foreground">
                    {counts.total} veículo{counts.total !== 1 ? 's' : ''} cadastrado{counts.total !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setEstadoTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${estadoTab === tab.id 
                        ? `${tab.activeColor} text-white shadow-md` 
                        : `${tab.bgColor} ${tab.color} hover:opacity-80`
                      }
                    `}
                  >
                    {tab.id === 'vencidos' && <AlertTriangle className="h-4 w-4" />}
                    {tab.id === 'proximos' && <Clock className="h-4 w-4" />}
                    {tab.id === 'em-dia' && <CheckCircle2 className="h-4 w-4" />}
                    {tab.label}
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-bold
                      ${estadoTab === tab.id ? 'bg-white/20' : tab.bgColor}
                    `}>
                      {tab.count}
                    </span>
                  </button>
                ))}
                
                {/* Ordenação */}
                <div className="ml-auto">
                  <div className="relative">
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={ordenacao}
                      onChange={(e) => setOrdenacao(e.target.value as OrdenacaoVeiculos)}
                      className="pl-10 text-sm"
                    >
                      <option value="vencimento-asc">Vencimento: mais próximo</option>
                      <option value="vencimento-desc">Vencimento: mais distante</option>
                      <option value="placa-asc">Placa: A-Z</option>
                      <option value="placa-desc">Placa: Z-A</option>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Veículos */}
              {veiculosOrdenadosPorTab.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500/50 mb-4" />
                    <p className="text-muted-foreground">Nenhum veículo nesta categoria</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {veiculosOrdenadosPorTab.map(veiculo => (
                    <VeiculoCardCompleto
                      key={veiculo.id}
                      veiculo={veiculo}
                      isUpdating={kanbanUpdatingId === veiculo.id}
                      onMarkAsPaid={handleCardMarkAsPaid}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        }
        
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Truck className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              Visualização não disponível.
            </p>
          </div>
        )
    }
  }

  const renderConfirmationModal = () => {
    if (!pendingDrop) return null
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={() => setPendingDrop(null)}>
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Confirmar movimentação</h3>
          <div className="mb-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Mover o veículo <span className="font-mono font-bold text-slate-900">{formatPlaca(pendingDrop.placa)}</span>:
            </p>
            <div className="flex items-center gap-3 justify-center">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                pendingDrop.fromCol === 'vencido' ? 'bg-red-100 text-red-700' :
                pendingDrop.fromCol === 'pendente' ? 'bg-amber-100 text-amber-700' :
                'bg-green-100 text-green-700'
              }`}>
                {COLUNA_LABELS[pendingDrop.fromCol]}
              </span>
              <ChevronRight className="h-5 w-5 text-slate-400" />
              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                pendingDrop.toCol === 'vencido' ? 'bg-red-100 text-red-700' :
                pendingDrop.toCol === 'pendente' ? 'bg-amber-100 text-amber-700' :
                'bg-green-100 text-green-700'
              }`}>
                {COLUNA_LABELS[pendingDrop.toCol]}
              </span>
            </div>
            {pendingDrop.estado === 'GO' && (
              <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-center">
                GO: IPVA e Licenciamento serão movidos juntos
              </p>
            )}
            <p className="text-xs text-muted-foreground text-center">
              {kanbanTipo === 'ipva' ? 'Status do IPVA' : 'Status do Licenciamento'} será atualizado
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setPendingDrop(null)}
            >
              Cancelar
            </Button>
            <Button
              className={`flex-1 text-white ${
                pendingDrop.toCol === 'vencido' ? 'bg-red-500 hover:bg-red-600' :
                pendingDrop.toCol === 'pendente' ? 'bg-amber-500 hover:bg-amber-600' :
                'bg-green-500 hover:bg-green-600'
              }`}
              onClick={handleConfirmDrop}
              disabled={kanbanUpdatingId !== null}
            >
              {kanbanUpdatingId ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />
      
      <Sidebar 
        currentView={currentView}
        onViewChange={handleViewChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        counts={sidebarCounts}
        estadosCounts={estadosCounts}
      />

      <main className="lg:pl-64 pt-16">
        <div className="p-4 lg:p-6">
          {renderContent()}
        </div>
      </main>

      {renderConfirmationModal()}
    </div>
  )
}

export default App
