import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple'
  className?: string
}

const variantStyles = {
  default: {
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    gradient: ''
  },
  primary: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    gradient: 'gradient-primary'
  },
  success: {
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    gradient: 'gradient-success'
  },
  warning: {
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    gradient: 'gradient-warning'
  },
  danger: {
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    gradient: 'gradient-danger'
  },
  purple: {
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    gradient: 'gradient-purple'
  }
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: StatsCardProps) {
  const styles = variantStyles[variant]
  const isGradient = variant !== 'default'

  return (
    <Card 
      variant="elevated" 
      className={cn(
        "overflow-hidden",
        isGradient && styles.gradient,
        className
      )}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={cn(
              "text-sm font-medium",
              isGradient ? "text-white/80" : "text-muted-foreground"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-2xl sm:text-3xl font-bold mt-2",
              isGradient ? "text-white" : "text-slate-900"
            )}>
              {value}
            </p>
            {subtitle && (
              <p className={cn(
                "text-xs mt-1",
                isGradient ? "text-white/70" : "text-muted-foreground"
              )}>
                {subtitle}
              </p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-xs font-medium",
                trend.isPositive 
                  ? (isGradient ? "text-white/90" : "text-emerald-600")
                  : (isGradient ? "text-white/90" : "text-red-600")
              )}>
                <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
                <span className={isGradient ? "text-white/60" : "text-muted-foreground"}>vs mês anterior</span>
              </div>
            )}
          </div>
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl shrink-0",
            isGradient ? "bg-white/20" : styles.iconBg
          )}>
            <Icon className={cn("h-6 w-6", isGradient ? "text-white" : styles.iconColor)} />
          </div>
        </div>
      </div>
    </Card>
  )
}
