import { 
  LayoutDashboard, 
  Truck,
  X,
  MapPin,
  Settings,
  Columns3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type ViewType = 'dashboard' | 'veiculos' | 'gerenciar' | 'kanban' | `estado-${string}`

interface EstadoCounts {
  vencidos: number
  proximos: number
  emDia: number
  total: number
}

interface SidebarProps {
  className?: string
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  isOpen?: boolean
  onClose?: () => void
  counts?: {
    veiculos: number
    vencidos: number
    proximos: number
    emDia: number
  }
  estadosCounts?: Record<string, EstadoCounts>
}

const ESTADO_NOMES: Record<string, string> = {
  SP: 'São Paulo',
  PR: 'Paraná',
  SC: 'Santa Catarina',
  RS: 'Rio Grande do Sul',
  MG: 'Minas Gerais',
  RJ: 'Rio de Janeiro',
  BA: 'Bahia',
  GO: 'Goiás',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
}

export function Sidebar({ className, currentView, onViewChange, isOpen, onClose, counts, estadosCounts }: SidebarProps) {
  const handleViewChange = (view: ViewType) => {
    onViewChange(view)
    if (onClose) onClose()
  }

  const estados = estadosCounts ? Object.keys(estadosCounts).sort() : []

  const sidebarContent = (
    <>
      {/* Mobile close button */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <span className="font-semibold text-slate-900">Menu</span>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0">
        {/* Dashboard */}
        <div className="hidden lg:block text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mb-2">
          Menu Principal
        </div>
        
        <button
          onClick={() => handleViewChange('dashboard')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
            currentView === 'dashboard' 
              ? "bg-primary text-white shadow-lg shadow-primary/25" 
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
            currentView === 'dashboard' ? "bg-white/20" : "bg-slate-100"
          )}>
            <LayoutDashboard className={cn("h-4 w-4", currentView === 'dashboard' ? "text-white" : "text-slate-600")} />
          </div>
          <span className="flex-1 text-left">Dashboard</span>
        </button>

        <button
          onClick={() => handleViewChange('veiculos')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
            currentView === 'veiculos' 
              ? "bg-primary text-white shadow-lg shadow-primary/25" 
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
            currentView === 'veiculos' ? "bg-white/20" : "bg-blue-50"
          )}>
            <Truck className={cn("h-4 w-4", currentView === 'veiculos' ? "text-white" : "text-blue-600")} />
          </div>
          <span className="flex-1 text-left">Todos os Veículos</span>
          {counts?.veiculos !== undefined && counts.veiculos > 0 && (
            <span className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full min-w-[24px] text-center",
              currentView === 'veiculos' ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            )}>
              {counts.veiculos}
            </span>
          )}
        </button>

        <button
          onClick={() => handleViewChange('kanban')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
            currentView === 'kanban' 
              ? "bg-primary text-white shadow-lg shadow-primary/25" 
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
            currentView === 'kanban' ? "bg-white/20" : "bg-purple-50"
          )}>
            <Columns3 className={cn("h-4 w-4", currentView === 'kanban' ? "text-white" : "text-purple-600")} />
          </div>
          <span className="flex-1 text-left">IPVA e Licenciamento</span>
        </button>

        <button
          onClick={() => handleViewChange('gerenciar')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
            currentView === 'gerenciar' 
              ? "bg-primary text-white shadow-lg shadow-primary/25" 
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
            currentView === 'gerenciar' ? "bg-white/20" : "bg-amber-50"
          )}>
            <Settings className={cn("h-4 w-4", currentView === 'gerenciar' ? "text-white" : "text-amber-600")} />
          </div>
          <span className="flex-1 text-left">Gerenciar Frota</span>
        </button>

        {/* Separador Estados */}
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-4 mb-2">
          Por Estado
        </div>

        {/* Estados */}
        {estados.map(estado => {
          const estadoCounts = estadosCounts![estado]
          const estadoNome = ESTADO_NOMES[estado] || estado
          const hasUrgent = estadoCounts.vencidos > 0
          const hasProximos = estadoCounts.proximos > 0
          const isActive = currentView === `estado-${estado}`

          return (
            <button
              key={estado}
              onClick={() => handleViewChange(`estado-${estado}` as ViewType)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/25" 
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                isActive ? "bg-white/20" : "bg-slate-100"
              )}>
                <MapPin className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-500")} />
              </div>
              <span className="flex-1 text-left">{estadoNome} ({estado})</span>
              {hasUrgent && (
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  isActive ? "bg-white" : "bg-red-500 animate-pulse"
                )} />
              )}
              {!hasUrgent && hasProximos && (
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  isActive ? "bg-white" : "bg-amber-500"
                )} />
              )}
              <span className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] text-center",
                isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              )}>
                {estadoCounts.total}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Footer info */}
      <div className="shrink-0 p-4 border-t bg-slate-50/50">
        <div className="text-xs text-center text-muted-foreground">
          <p>Gestão de Frota</p>
          <p className="font-medium text-slate-600">IPVA & Licenciamento</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white/80 backdrop-blur-sm border-r flex-col",
        className
      )}>
        {sidebarContent}
      </aside>
    </>
  )
}
