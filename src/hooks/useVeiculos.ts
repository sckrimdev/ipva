import { useState, useEffect, useCallback } from 'react'
import { veiculosService } from '@/services/veiculosService'
import type { VeiculoSupabase } from '@/types'

interface UseVeiculosReturn {
  veiculos: VeiculoSupabase[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useVeiculos(): UseVeiculosReturn {
  const [veiculos, setVeiculos] = useState<VeiculoSupabase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVeiculos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await veiculosService.getAll()
      setVeiculos(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar veículos'
      setError(message)
      console.error('Erro ao buscar veículos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVeiculos()
  }, [fetchVeiculos])

  return {
    veiculos,
    loading,
    error,
    refetch: fetchVeiculos
  }
}
