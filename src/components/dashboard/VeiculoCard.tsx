import { cn, formatCurrency, formatPlaca, getDaysUntil } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ESTADOS_INFO, type Veiculo, type IPVA, type Licenciamento } from '@/types'
import { Truck, Calendar, AlertTriangle, CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react'

interface VeiculoCardProps {
  veiculo: Veiculo
  ipva?: IPVA
  licenciamento?: Licenciamento
  onClick?: () => void
}

const statusConfig = {
  pago: { label: 'Pago', variant: 'success' as const, icon: CheckCircle2 },
  pendente: { label: 'Pendente', variant: 'warning' as const, icon: Clock },
  vencido: { label: 'Vencido', variant: 'danger' as const, icon: XCircle },
  proximo: { label: 'Vence em breve', variant: 'warning' as const, icon: AlertTriangle }
}

export function VeiculoCard({ veiculo, ipva, licenciamento, onClick }: VeiculoCardProps) {
  const estadoInfo = ESTADOS_INFO[veiculo.estado]
  const ipvaStatus = ipva ? statusConfig[ipva.status] : null
  const licStatus = licenciamento ? statusConfig[licenciamento.status] : null

  const daysUntilIpva = ipva ? getDaysUntil(ipva.dataVencimento) : null
  const daysUntilLic = licenciamento ? getDaysUntil(licenciamento.dataVencimento) : null

  const handlePixSP = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(veiculo.renavam).then(() => {
      // Abre o site da SEFAZ em nova aba
      window.open('https://pixveiculos.fazenda.sp.gov.br/pix/buscar-debitos', '_blank')
    })
  }

  return (
    <Card 
      variant="elevated" 
      className={cn(
        "cursor-pointer hover:scale-[1.02] transition-all duration-200",
        onClick && "hover:shadow-xl"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl",
              veiculo.tipo === 'tracao' ? 'bg-blue-100' : 'bg-purple-100'
            )}>
              <Truck className={cn(
                "h-5 w-5",
                veiculo.tipo === 'tracao' ? 'text-blue-600' : 'text-purple-600'
              )} />
            </div>
            <div>
              <CardTitle className="text-base">
                {formatPlaca(veiculo.placa)}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {veiculo.marca} {veiculo.modelo}
              </p>
            </div>
          </div>
          <Badge className={cn(estadoInfo.bgColor, estadoInfo.cor, "border-0")}>
            {veiculo.estado}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Tipo do veículo */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tipo</span>
          <span className="font-medium capitalize">{veiculo.tipo}</span>
        </div>

        {/* Ano */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Ano</span>
          <span className="font-medium">{veiculo.anoFabricacao}/{veiculo.anoModelo}</span>
        </div>

        {/* Valor Venal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Valor Venal</span>
          <span className="font-medium">{formatCurrency(veiculo.valorVenal)}</span>
        </div>

        <div className="border-t pt-3 space-y-2">
          {/* IPVA Status */}
          {ipva && ipvaStatus && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ipvaStatus.icon className={cn("h-4 w-4", 
                  ipva.status === 'pago' ? 'text-emerald-500' :
                  ipva.status === 'vencido' ? 'text-red-500' :
                  'text-amber-500'
                )} />
                <span className="text-sm">IPVA</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={ipvaStatus.variant} className="text-xs">
                  {ipvaStatus.label}
                </Badge>
                {daysUntilIpva !== null && ipva.status !== 'pago' && (
                  <span className={cn("text-xs", 
                    daysUntilIpva < 0 ? 'text-red-500' : 
                    daysUntilIpva <= 15 ? 'text-amber-500' : 
                    'text-muted-foreground'
                  )}>
                    {daysUntilIpva < 0 
                      ? `${Math.abs(daysUntilIpva)}d atrás` 
                      : `${daysUntilIpva}d`
                    }
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Licenciamento Status */}
          {licenciamento && licStatus && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className={cn("h-4 w-4", 
                  licenciamento.status === 'pago' ? 'text-emerald-500' :
                  licenciamento.status === 'vencido' ? 'text-red-500' :
                  'text-amber-500'
                )} />
                <span className="text-sm">Licenciamento</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={licStatus.variant} className="text-xs">
                  {licStatus.label}
                </Badge>
                {daysUntilLic !== null && licenciamento.status !== 'pago' && (
                  <span className={cn("text-xs", 
                    daysUntilLic < 0 ? 'text-red-500' : 
                    daysUntilLic <= 15 ? 'text-amber-500' : 
                    'text-muted-foreground'
                  )}>
                    {daysUntilLic < 0 
                      ? `${Math.abs(daysUntilLic)}d atrás` 
                      : `${daysUntilLic}d`
                    }
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botão PIX SEFAZ SP */}
        {veiculo.estado === 'SP' && (
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
              onClick={handlePixSP}
            >
              <ExternalLink className="h-4 w-4" />
              PIX SEFAZ SP
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
