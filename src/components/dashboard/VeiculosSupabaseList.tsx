import { useVeiculos } from '@/hooks/useVeiculos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Truck, AlertCircle, Loader2 } from 'lucide-react'

const ESTADO_INFO: Record<string, { nome: string; cor: string; bgColor: string }> = {
  SP: { nome: 'São Paulo', cor: 'text-blue-700', bgColor: 'bg-blue-100' },
  PR: { nome: 'Paraná', cor: 'text-red-700', bgColor: 'bg-red-100' },
  SC: { nome: 'Santa Catarina', cor: 'text-green-700', bgColor: 'bg-green-100' },
  RS: { nome: 'Rio Grande do Sul', cor: 'text-purple-700', bgColor: 'bg-purple-100' },
}

function formatPlaca(placa: string): string {
  return placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
}

export function VeiculosSupabaseList() {
  const { veiculos, loading, error, refetch } = useVeiculos()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando veículos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-3 p-6">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <div>
            <p className="font-medium text-red-700">Erro ao carregar veículos</p>
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
  }

  if (veiculos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <Truck className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nenhum veículo cadastrado</p>
          <p className="text-sm text-muted-foreground/70">
            Adicione veículos na tabela do Supabase
          </p>
        </CardContent>
      </Card>
    )
  }

  // Agrupar por estado
  const veiculosPorEstado = veiculos.reduce((acc, v) => {
    const estado = v.estado_veiculo || 'Outros'
    if (!acc[estado]) acc[estado] = []
    acc[estado].push(v)
    return acc
  }, {} as Record<string, typeof veiculos>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Veículos do Supabase</h2>
        <Badge variant="secondary" className="text-sm">
          {veiculos.length} veículo{veiculos.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {Object.entries(veiculosPorEstado).map(([estado, veiculosEstado]) => {
        const info = ESTADO_INFO[estado] || { nome: estado, cor: 'text-slate-700', bgColor: 'bg-slate-100' }
        
        return (
          <Card key={estado}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Badge className={`${info.bgColor} ${info.cor} border-0`}>
                  {estado}
                </Badge>
                <span>{info.nome}</span>
                <span className="text-muted-foreground font-normal text-sm ml-auto">
                  {veiculosEstado.length} veículo{veiculosEstado.length !== 1 ? 's' : ''}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {veiculosEstado.map((veiculo) => (
                  <div
                    key={veiculo.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-slate-400" />
                      <div>
                        <span className="font-mono font-bold text-lg">
                          {formatPlaca(veiculo.placa_veiculo)}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          RENAVAM: {veiculo.renavam_veiculo}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(veiculo.created_at).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
