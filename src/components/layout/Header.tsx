import { Truck, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onMenuToggle?: () => void
  isSidebarOpen?: boolean
}

export function Header({ onMenuToggle, isSidebarOpen }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="lg:hidden shrink-0"
            onClick={onMenuToggle}
            aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-primary shadow-lg shadow-primary/25">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Frota IPVA
              </h1>
              <p className="text-xs text-muted-foreground">Gestão de IPVA e Licenciamento</p>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Ano atual */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
              <span className="text-sm text-slate-600">Ano Base:</span>
              <span className="text-sm font-semibold text-slate-900">2026</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
