import { cn, formatPlaca, formatCurrency, formatDate, getDaysUntil } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ESTADOS_INFO, type Veiculo, type IPVA, type Licenciamento } from '@/types'
import { AlertTriangle, Calendar, CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react'

interface VencimentosListProps {
  veiculos: Veiculo[]
  ipvas: IPVA[]
  licenciamentos: Licenciamento[]
  maxItems?: number
}

type VencimentoItem = {
  id: string
  veiculo: Veiculo
  tipo: 'ipva' | 'licenciamento'
  valor: number
  dataVencimento: string
  status: 'pendente' | 'pago' | 'vencido' | 'proximo'
  diasRestantes: number
}

export function VencimentosList({ veiculos, ipvas, licenciamentos, maxItems = 5 }: VencimentosListProps) {
  // Combinar todos os vencimentos não pagos
  const vencimentos: VencimentoItem[] = []

  ipvas.forEach(ipva => {
    if (ipva.status !== 'pago') {
      const veiculo = veiculos.find(v => v.id === ipva.veiculoId)
      if (veiculo) {
        vencimentos.push({
          id: ipva.id,
          veiculo,
          tipo: 'ipva',
          valor: ipva.valor,
          dataVencimento: ipva.dataVencimento,
          status: ipva.status,
          diasRestantes: getDaysUntil(ipva.dataVencimento)
        })
      }
    }
  })

  licenciamentos.forEach(lic => {
    if (lic.status !== 'pago') {
      const veiculo = veiculos.find(v => v.id === lic.veiculoId)
      if (veiculo) {
        vencimentos.push({
          id: lic.id,
          veiculo,
          tipo: 'licenciamento',
          valor: lic.valor,
          dataVencimento: lic.dataVencimento,
          status: lic.status,
          diasRestantes: getDaysUntil(lic.dataVencimento)
        })
      }
    }
  })

  // Ordenar por dias restantes (mais urgentes primeiro)
  vencimentos.sort((a, b) => a.diasRestantes - b.diasRestantes)

  const vencimentosExibidos = vencimentos.slice(0, maxItems)

  const getStatusIcon = (diasRestantes: number) => {
    if (diasRestantes < 0) return <XCircle className="h-4 w-4 text-red-500" />
    if (diasRestantes <= 7) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (diasRestantes <= 15) return <AlertTriangle className="h-4 w-4 text-amber-500" />
    if (diasRestantes <= 30) return <Clock className="h-4 w-4 text-amber-500" />
    return <Calendar className="h-4 w-4 text-slate-400" />
  }

  const getStatusBadge = (diasRestantes: number) => {
    if (diasRestantes < 0) return <Badge variant="danger">Vencido</Badge>
    if (diasRestantes <= 7) return <Badge variant="danger">Urgente</Badge>
    if (diasRestantes <= 15) return <Badge variant="warning">Em breve</Badge>
    if (diasRestantes <= 30) return <Badge variant="info">Atenção</Badge>
    return <Badge variant="secondary">No prazo</Badge>
  }

  if (vencimentos.length === 0) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Próximos Vencimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
            <p className="text-sm text-muted-foreground">
              Todos os pagamentos estão em dia! 🎉
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="elevated">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Próximos Vencimentos
        </CardTitle>
        {vencimentos.length > maxItems && (
          <Button variant="ghost" size="sm" className="text-xs">
            Ver todos ({vencimentos.length})
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {vencimentosExibidos.map((item) => {
          const estadoInfo = ESTADOS_INFO[item.veiculo.estado]
          
          return (
            <div 
              key={item.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-colors",
                item.diasRestantes < 0 ? "bg-red-50" :
                item.diasRestantes <= 7 ? "bg-red-50/50" :
                item.diasRestantes <= 15 ? "bg-amber-50" :
                "bg-slate-50"
              )}
            >
              {getStatusIcon(item.diasRestantes)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {formatPlaca(item.veiculo.placa)}
                  </span>
                  <Badge className={cn(estadoInfo.bgColor, estadoInfo.cor, "border-0 text-xs")}>
                    {item.veiculo.estado}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{item.tipo}</span>
                  <span>•</span>
                  <span>{formatDate(item.dataVencimento)}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-sm">
                  {formatCurrency(item.valor)}
                </p>
                <p className={cn("text-xs", 
                  item.diasRestantes < 0 ? "text-red-600 font-medium" :
                  item.diasRestantes <= 15 ? "text-amber-600" :
                  "text-muted-foreground"
                )}>
                  {item.diasRestantes < 0 
                    ? `${Math.abs(item.diasRestantes)} dias atrás`
                    : item.diasRestantes === 0 
                      ? 'Vence hoje!'
                      : `${item.diasRestantes} dias`
                  }
                </p>
              </div>

              {getStatusBadge(item.diasRestantes)}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
