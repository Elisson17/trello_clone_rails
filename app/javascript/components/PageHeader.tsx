import { type ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * O conteúdo entra na barra do shell em vez de abrir uma segunda barra logo abaixo dela.
 * Sem shell (telas de auth, testes de página isolada) ele renderiza no lugar mesmo.
 */
export function PageHeader({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null)

  useEffect(() => setSlot(document.getElementById('page-header')), [])

  return slot ? createPortal(children, slot) : children
}
