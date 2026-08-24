import { useEffect, useRef } from 'react'

const TYPING = 'input, textarea, select, [contenteditable="true"]'

/**
 * Atalho de tecla única na página. Quem está digitando não perde a tecla, e combinação com
 * modificador é do navegador, não nossa.
 */
export function useShortcut(key: string, handler: () => void) {
  const latest = useRef(handler)
  latest.current = handler

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== key || event.metaKey || event.ctrlKey || event.altKey) return
      if ((event.target as HTMLElement | null)?.closest(TYPING)) return

      event.preventDefault()
      latest.current()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [key])
}
