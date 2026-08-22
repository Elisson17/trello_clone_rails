import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
const STORAGE_KEY = 'theme'

const systemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const stored = (): Theme => {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' ? value : 'system'
}

const apply = (theme: Theme) => {
  const resolved = theme === 'system' ? systemTheme() : theme
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  return resolved
}

/** Aplica o tema já no primeiro paint, antes do React montar (evita flash de tema errado). */
export const initTheme = () => apply(stored())

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(stored)
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => apply(stored()))

  const setTheme = useCallback((next: Theme) => {
    next === 'system'
      ? localStorage.removeItem(STORAGE_KEY)
      : localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
    setResolved(apply(next))
  }, [])

  useEffect(() => {
    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setResolved(apply('system'))
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  return { theme, resolved, setTheme }
}
