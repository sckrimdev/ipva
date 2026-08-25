import { cn, formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ESTADOS_INFO, type Estado } from '@/types'

interface EstadoResumoProps {
  estado: Estado
  totalVeiculos: number
  ipvaPago: number
  ipvaPendente: number
  valorTotalIPVA: number
  valorPagoIPVA: number
}

export function EstadoResumoCard({ 
  estado, 
  totalVeiculos, 
  ipvaPago, 
  ipvaPendente,
  valorTotalIPVA,
  valorPagoIPVA
}: EstadoResumoProps) {
  const estadoInfo = ESTADOS_INFO[estado]
  const percentualPago = valorTotalIPVA > 0 ? (valorPagoIPVA / valorTotalIPVA) * 100 : 0

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              estado === 'SP' ? 'bg-red-500' :
              estado === 'PR' ? 'bg-blue-500' :
              estado === 'SC' ? 'bg-green-500' :
              'bg-amber-500'
            )} />
            {estadoInfo.nome}
          </CardTitle>
          <span className={cn("text-lg font-bold", estadoInfo.cor)}>
            {estado}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Veículos */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Veículos</span>
          <span className="font-semibold">{totalVeiculos}</span>
        </div>

        {/* IPVA Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">IPVA 2026</span>
            <span className="font-semibold">{formatCurrency(valorTotalIPVA)}</span>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                percentualPago >= 100 ? 'bg-emerald-500' :
                percentualPago >= 50 ? 'bg-blue-500' :
                percentualPago > 0 ? 'bg-amber-500' :
                'bg-slate-300'
              )}
              style={{ width: `${Math.min(percentualPago, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-600">
              {ipvaPago} pago{ipvaPago !== 1 ? 's' : ''}
            </span>
            <span className="text-amber-600">
              {ipvaPendente} pendente{ipvaPendente !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Valor pago */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pago</span>
            <span className="text-sm font-semibold text-emerald-600">
              {formatCurrency(valorPagoIPVA)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-muted-foreground">Pendente</span>
            <span className="text-sm font-semibold text-amber-600">
              {formatCurrency(valorTotalIPVA - valorPagoIPVA)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
